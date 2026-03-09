import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { read, utils } from "npm:xlsx@0.18.5";

const REQUIRED_COLS = ["nombre", "cedula", "banco_actual", "etapa", "subestado"];

const ETAPA_MAP: Record<string, string> = {
  preaprobacion: "preaprobacion",
  "preaprobación": "preaprobacion",
  aprobacion: "aprobacion",
  "aprobación": "aprobacion",
  legalizacion: "legalizacion",
  "legalización": "legalizacion",
  desembolsado: "desembolsado",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, content-type, x-client-info, apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization header");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const userClient = createClient(
      supabaseUrl,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const projectId = formData.get("project_id") as string;

    if (!file || !projectId) throw new Error("Missing file or project_id");

    const buffer = await file.arrayBuffer();
    const workbook = read(new Uint8Array(buffer), { type: "array" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows: Record<string, any>[] = utils.sheet_to_json(sheet, {
      defval: "",
    });

    if (rows.length === 0) throw new Error("El archivo está vacío");

    const normalizedRows = rows.map((row) => {
      const nr: Record<string, any> = {};
      for (const [k, v] of Object.entries(row)) {
        nr[k.toLowerCase().trim()] = typeof v === "string" ? v.trim() : v;
      }
      return nr;
    });

    const { data: importRec, error: importErr } = await supabase
      .from("imports")
      .insert({
        project_id: projectId,
        file_name: file.name,
        uploaded_by: user.id,
        inserted_count: 0,
        updated_count: 0,
        error_count: 0,
        status: "processing",
      })
      .select()
      .single();

    if (importErr)
      throw new Error(`Error creating import: ${importErr.message}`);
    const importId = importRec.id;

    let inserted = 0;
    let updated = 0;
    let errCount = 0;
    const rowErrors: any[] = [];

    for (let i = 0; i < normalizedRows.length; i++) {
      const row = normalizedRows[i];
      const rowNum = i + 2;
      let hasErr = false;

      for (const col of REQUIRED_COLS) {
        if (!row[col] && row[col] !== 0) {
          hasErr = true;
          rowErrors.push({
            import_id: importId,
            row_number: rowNum,
            field: col,
            message: `Campo '${col}' vacío`,
            raw_value: String(row[col] ?? ""),
          });
        }
      }

      const etapaRaw = String(row.etapa || "").toLowerCase().trim();
      const etapaNorm = ETAPA_MAP[etapaRaw];
      if (row.etapa && !etapaNorm) {
        hasErr = true;
        rowErrors.push({
          import_id: importId,
          row_number: rowNum,
          field: "etapa",
          message: `Etapa inválida: '${row.etapa}'`,
          raw_value: String(row.etapa),
        });
      }

      if (hasErr) {
        errCount++;
        continue;
      }

      try {
        const cedula = String(row.cedula).trim();
        const { data: person, error: pErr } = await supabase
          .from("persons")
          .upsert(
            {
              cedula,
              nombre_completo: String(
                row.nombre || row.nombre_completo || ""
              ),
              ciudad: String(row.ciudad_cliente || row.ciudad || ""),
              email: row.email ? String(row.email) : null,
              telefono: row.telefono ? String(row.telefono) : null,
            },
            { onConflict: "cedula" }
          )
          .select("id")
          .single();
        if (pErr) throw pErr;

        const { data: existing } = await supabase
          .from("cases")
          .select("id")
          .eq("project_id", projectId)
          .eq("person_id", person.id)
          .maybeSingle();

        const cd: Record<string, any> = {
          etapa_macro: etapaNorm,
          subestado: String(row.subestado || ""),
          banco_actual: String(row.banco_actual || ""),
        };
        if (row.ciudad_inmueble) cd.ciudad_inmueble = String(row.ciudad_inmueble);
        if (row.monto_inmueble) cd.monto_inmueble = Number(row.monto_inmueble);
        if (row.monto_a_financiar || row.monto_financiar)
          cd.monto_a_financiar = Number(
            row.monto_a_financiar || row.monto_financiar
          );
        if (row.fecha_carta_aprobacion)
          cd.fecha_carta_aprobacion = String(row.fecha_carta_aprobacion);
        if (row.vigencia_dias) cd.vigencia_dias = Number(row.vigencia_dias);

        if (existing) {
          const { error: uErr } = await supabase
            .from("cases")
            .update(cd)
            .eq("id", existing.id);
          if (uErr) throw uErr;
          updated++;
        } else {
          const { error: iErr } = await supabase
            .from("cases")
            .insert({ ...cd, project_id: projectId, person_id: person.id });
          if (iErr) throw iErr;
          inserted++;
        }
      } catch (dbErr: any) {
        errCount++;
        rowErrors.push({
          import_id: importId,
          row_number: rowNum,
          field: "_db",
          message: dbErr.message || "DB error",
          raw_value: "",
        });
      }
    }

    if (rowErrors.length > 0) {
      await supabase.from("import_row_errors").insert(rowErrors);
    }

    const finalStatus =
      errCount > 0 ? "completed_with_errors" : "completed";
    const { data: final, error: fErr } = await supabase
      .from("imports")
      .update({
        inserted_count: inserted,
        updated_count: updated,
        error_count: errCount,
        status: finalStatus,
      })
      .eq("id", importId)
      .select()
      .single();

    if (fErr) throw fErr;

    return new Response(JSON.stringify(final), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ message: err.message || "Internal error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

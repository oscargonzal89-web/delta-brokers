import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { read, utils } from "npm:xlsx@0.18.5";

/**
 * Maps normalized Excel column names to their target table and field.
 * Normalization: lowercase + trim (accent variants included).
 */
interface ColMapping {
  table: "persons" | "cases" | "projects" | "assignments";
  field: string;
  type?: "string" | "number" | "date";
}

const COLUMN_MAP: Record<string, ColMapping> = {
  // Comprador 1 → persons
  comprador1: { table: "persons", field: "nombre_cliente" },
  identificacion_comprador1: { table: "persons", field: "cedula" },
  email_comprador1: { table: "persons", field: "correo" },
  telefono_comprador1: { table: "persons", field: "celular" },

  // Comprador 2 → cases
  comprador2: { table: "cases", field: "nombre_cliente_comprador_2" },
  identificacion_comprador2: { table: "cases", field: "cedula_comprador_2" },
  email_comprador2: { table: "cases", field: "correo_comprador_2" },
  telefono_comprador2: { table: "cases", field: "celular_comprador_2" },

  // Inmueble → cases
  torre: { table: "cases", field: "torre" },
  apto: { table: "cases", field: "apto" },
  precio: { table: "cases", field: "monto_inmueble", type: "number" },
  "monto a financiar": { table: "cases", field: "monto_a_financiar", type: "number" },

  // Scoring / financiero → persons
  "ocupacion": { table: "persons", field: "ocupacion" },
  "ocupaci\u00f3n": { table: "persons", field: "ocupacion" },
  "calificacion solicitante": { table: "persons", field: "calificacion_solicitante" },
  "calificaci\u00f3n solicitante": { table: "persons", field: "calificacion_solicitante" },
  score: { table: "persons", field: "score", type: "number" },
  "puntaje minimo": { table: "persons", field: "puntaje_minimo", type: "number" },
  "puntaje m\u00ednimo": { table: "persons", field: "puntaje_minimo", type: "number" },
  "ingreso automatico": { table: "persons", field: "ingreso_automatico", type: "number" },
  "ingreso autom\u00e1tico": { table: "persons", field: "ingreso_automatico", type: "number" },
  deudas: { table: "persons", field: "deudas", type: "number" },
  "gastos basicos": { table: "persons", field: "gastos_basicos", type: "number" },
  "gastos b\u00e1sicos": { table: "persons", field: "gastos_basicos", type: "number" },
  "total egresos": { table: "persons", field: "total_egresos", type: "number" },

  // Proyecto → projects (updates the project selected in the UI; no project creation from Excel)
  // Banco Constructor populates both the case banco_actual and the project bank
  "banco constructor": { table: "cases", field: "banco_actual" },
  etapa: { table: "projects", field: "etapa_proyecto" },
  ciudad: { table: "projects", field: "ciudad" },
  "tipo de vivienda": { table: "projects", field: "tipo_vivienda" },
  mes_proyectado_escritura: { table: "projects", field: "fecha_proyectada_escritura", type: "date" },

  // Asignación
  "correo analista": { table: "assignments", field: "analista_delta_id" },
};

/** Remove diacritics and normalize a string for key lookup. */
function normalizeKey(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/** Build a lookup map from normalized headers to their original keys. */
function buildNormalizedRow(raw: Record<string, any>): Record<string, any> {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(raw)) {
    out[normalizeKey(k)] = v;
  }
  return out;
}

/** Convert an XLSX serial date or string to ISO date string (YYYY-MM-DD). */
function toIsoDate(value: any): string | null {
  if (!value) return null;
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "number") {
    // XLSX serial date: days since 1899-12-30
    const date = new Date(Math.round((value - 25569) * 86400 * 1000));
    return date.toISOString().slice(0, 10);
  }
  const s = String(value).trim();
  // Accept formats like MM/YYYY, YYYY-MM, YYYY-MM-DD
  if (/^\d{2}\/\d{4}$/.test(s)) {
    const [m, y] = s.split("/");
    return `${y}-${m}-01`;
  }
  if (/^\d{4}-\d{2}$/.test(s)) return `${s}-01`;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return null;
}

/** Cast a raw cell value to the expected type. */
function castValue(value: any, type?: "string" | "number" | "date"): any {
  if (value === "" || value === null || value === undefined) return null;
  if (type === "number") {
    const n = typeof value === "number" ? value : Number(String(value).replace(/[,$]/g, ""));
    return isNaN(n) ? null : n;
  }
  if (type === "date") return toIsoDate(value);
  return String(value).trim() || null;
}

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
    const workbook = read(new Uint8Array(buffer), { type: "array", cellDates: true });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawRows: Record<string, any>[] = utils.sheet_to_json(sheet, { defval: "" });

    if (rawRows.length === 0) throw new Error("El archivo está vacío");

    // Create import record
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

    if (importErr) throw new Error(`Error creating import: ${importErr.message}`);
    const importId = importRec.id;

    let inserted = 0;
    let updated = 0;
    let errCount = 0;
    const rowErrors: any[] = [];

    // Update selected project fields once from first row (lazy, cached)
    let projectUpdated = false;
    const analystCache: Record<string, string | null> = {};

    for (let i = 0; i < rawRows.length; i++) {
      const rowNum = i + 2;
      const row = buildNormalizedRow(rawRows[i]);

      // Split row data by target table using the column map
      const personData: Record<string, any> = {};
      const caseData: Record<string, any> = {};
      const projectData: Record<string, any> = {};
      let analystEmail: string | null = null;

      for (const [normalizedKey, mapping] of Object.entries(COLUMN_MAP)) {
        const rawValue = row[normalizedKey];
        if (rawValue === "" || rawValue === null || rawValue === undefined) continue;

        const casted = castValue(rawValue, mapping.type);
        if (casted === null) continue;

        if (mapping.table === "persons") {
          personData[mapping.field] = casted;
        } else if (mapping.table === "cases") {
          caseData[mapping.field] = casted;
        } else if (mapping.table === "projects") {
          projectData[mapping.field] = casted;
        } else if (mapping.table === "assignments") {
          analystEmail = String(casted).toLowerCase().trim();
        }
      }

      // Require at minimum cedula + nombre_cliente to create a person
      if (!personData.cedula || !personData.nombre_cliente) {
        errCount++;
        rowErrors.push({
          import_id: importId,
          row_number: rowNum,
          field: "IDENTIFICACION_COMPRADOR1 / COMPRADOR1",
          message: "Cédula o nombre del comprador 1 faltante",
          raw_value: String(personData.cedula ?? ""),
        });
        continue;
      }

      try {
        // ── 1. Update project fields from Excel (once, using the UI-selected project) ──
        const hasProjectData = Object.keys(projectData).length > 0;
        if (hasProjectData && !projectUpdated) {
          await supabase.from("projects").update(projectData).eq("id", projectId);
          projectUpdated = true;
        }

        // ── 2. Upsert person ───────────────────────────────────────────────
        const cedula = String(personData.cedula).trim();
        const { data: person, error: personErr } = await supabase
          .from("persons")
          .upsert({ ...personData, cedula }, { onConflict: "cedula" })
          .select("id")
          .single();
        if (personErr) throw personErr;

        // ── 3. Upsert case ─────────────────────────────────────────────────
        const { data: existing } = await supabase
          .from("cases")
          .select("id")
          .eq("project_id", projectId)
          .eq("person_id", person.id)
          .maybeSingle();

        // Default banco_actual to empty string if not provided in Excel
        const bancoActual = "";

        if (existing) {
          const { error: uErr } = await supabase
            .from("cases")
            .update(caseData)
            .eq("id", existing.id);
          if (uErr) throw uErr;
          updated++;

          // ── 4. Assignment (only analista_delta_id, preserve other slots) ─
          if (analystEmail) {
            const analystId = await resolveAnalystId(supabase, analystEmail, analystCache);
            if (analystId) {
              const { data: existingAssignment } = await supabase
                .from("assignments").select("id").eq("case_id", existing.id).maybeSingle();
              if (existingAssignment) {
                await supabase.from("assignments")
                  .update({ analista_delta_id: analystId })
                  .eq("case_id", existing.id);
              } else {
                await supabase.from("assignments")
                  .insert({ case_id: existing.id, analista_delta_id: analystId });
              }
            } else {
              rowErrors.push({
                import_id: importId, row_number: rowNum,
                field: "Correo Analista",
                message: `Analista no encontrado: ${analystEmail}`,
                raw_value: analystEmail,
              });
            }
          }
        } else {
          const { data: newCase, error: iErr } = await supabase
            .from("cases")
            .insert({
              ...caseData,
              project_id: projectId,
              person_id: person.id,
              banco_actual: caseData.banco_actual ?? "",
              etapa_macro: "estado_cliente",
              subestado: "",
            })
            .select("id")
            .single();
          if (iErr) throw iErr;
          inserted++;

          // ── 4. Assignment ────────────────────────────────────────────────
          if (analystEmail && newCase) {
            const analystId = await resolveAnalystId(supabase, analystEmail, analystCache);
            if (analystId) {
              await supabase.from("assignments")
                .insert({ case_id: newCase.id, analista_delta_id: analystId });
            } else {
              rowErrors.push({
                import_id: importId, row_number: rowNum,
                field: "Correo Analista",
                message: `Analista no encontrado: ${analystEmail}`,
                raw_value: analystEmail,
              });
            }
          }
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

    const finalStatus = errCount > 0 ? "completed_with_errors" : "completed";
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

/**
 * Resolve a user_profile ID from an email address (case-insensitive).
 * Results are cached to avoid redundant DB lookups.
 */
async function resolveAnalystId(
  supabase: ReturnType<typeof createClient>,
  email: string,
  cache: Record<string, string | null>
): Promise<string | null> {
  if (email in cache) return cache[email];
  const { data } = await supabase
    .from("user_profiles")
    .select("id")
    .ilike("email", email)
    .order("created_at", { ascending: false })
    .limit(1);
  cache[email] = data?.[0]?.id ?? null;
  return cache[email];
}

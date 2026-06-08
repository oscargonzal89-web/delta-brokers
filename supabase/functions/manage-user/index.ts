import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

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
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is an authenticated admin
    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const {
      data: { user },
      error: authError,
    } = await userClient.auth.getUser();
    if (authError || !user) throw new Error("Unauthorized");

    const { data: profile } = await userClient
      .from("user_profiles")
      .select("rol")
      .eq("id", user.id)
      .single();

    if (profile?.rol !== "administrador") {
      throw new Error("Forbidden: admin role required");
    }

    // Use service role for admin operations
    const adminClient = createClient(supabaseUrl, serviceRoleKey);

    const body = await req.json();
    const { action } = body;

    // ── CREATE USER ───────────────────────────────────────────────────────────
    if (action === "create") {
      const { email, nombre, rol, password } = body as {
        email: string;
        nombre: string;
        rol: string;
        password: string;
      };

      if (!email || !nombre || !rol || !password) {
        throw new Error("email, nombre, rol and password are required");
      }

      // Create auth user (auto-confirmed, no email sent)
      const { data: authUser, error: createErr } =
        await adminClient.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
      if (createErr) throw createErr;

      // Update the profile created by the trigger with nombre + rol
      const { data: updatedProfile, error: profileErr } = await adminClient
        .from("user_profiles")
        .upsert({
          id: authUser.user.id,
          email,
          nombre,
          rol,
          activo: true,
        })
        .select()
        .single();

      if (profileErr) throw profileErr;

      return new Response(JSON.stringify(updatedProfile), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── DELETE USER ───────────────────────────────────────────────────────────
    if (action === "delete") {
      const { user_id } = body as { user_id: string };
      if (!user_id) throw new Error("user_id is required");

      // Remove profile first (in case no cascade FK)
      await adminClient.from("user_profiles").delete().eq("id", user_id);

      // Delete auth user
      const { error: deleteErr } =
        await adminClient.auth.admin.deleteUser(user_id);
      if (deleteErr) throw deleteErr;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
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

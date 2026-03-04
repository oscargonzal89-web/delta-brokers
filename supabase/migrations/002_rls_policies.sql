-- ============================================================
-- Delta Brokers Credit Ops — Migración 002: Row Level Security
-- PRD §5 Usuarios, roles y permisos
-- ============================================================

-- ========================
-- FUNCIÓN HELPER: obtener rol del usuario actual
-- ========================

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS rol_usuario AS $$
  SELECT rol FROM public.user_profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND rol = 'administrador' AND activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_coordinator_or_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
      AND rol IN ('coordinador', 'administrador')
      AND activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid() AND activo = true
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ========================
-- HABILITAR RLS EN TODAS LAS TABLAS
-- ========================

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE persons ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE imports ENABLE ROW LEVEL SECURITY;
ALTER TABLE import_row_errors ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalogo_subestados ENABLE ROW LEVEL SECURITY;

-- ========================
-- POLÍTICAS: user_profiles
-- ========================

CREATE POLICY "Users can read all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Admin can insert profiles"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can delete profiles"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ========================
-- POLÍTICAS: projects
-- ========================

CREATE POLICY "All authenticated can read projects"
  ON projects FOR SELECT
  TO authenticated
  USING (public.is_active_user());

CREATE POLICY "Admin can create projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admin can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (public.is_admin());

CREATE POLICY "Admin can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ========================
-- POLÍTICAS: persons
-- ========================

CREATE POLICY "All authenticated can read persons"
  ON persons FOR SELECT
  TO authenticated
  USING (public.is_active_user());

CREATE POLICY "Coordinator/Admin can insert persons"
  ON persons FOR INSERT
  TO authenticated
  WITH CHECK (public.is_coordinator_or_admin());

CREATE POLICY "Coordinator/Admin can update persons"
  ON persons FOR UPDATE
  TO authenticated
  USING (public.is_coordinator_or_admin());

-- ========================
-- POLÍTICAS: cases
-- ========================

CREATE POLICY "All authenticated can read cases"
  ON cases FOR SELECT
  TO authenticated
  USING (public.is_active_user());

CREATE POLICY "Coordinator/Admin can insert cases"
  ON cases FOR INSERT
  TO authenticated
  WITH CHECK (public.is_coordinator_or_admin());

CREATE POLICY "Coordinator/Admin can update any case"
  ON cases FOR UPDATE
  TO authenticated
  USING (public.is_coordinator_or_admin());

CREATE POLICY "Analyst can update assigned cases"
  ON cases FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignments a
      WHERE a.case_id = cases.id
        AND (a.analista_delta_id = auth.uid()
          OR a.analista_radicacion_id = auth.uid()
          OR a.analista_legalizacion_id = auth.uid())
    )
  );

-- ========================
-- POLÍTICAS: assignments
-- ========================

CREATE POLICY "All authenticated can read assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (public.is_active_user());

CREATE POLICY "Coordinator/Admin can manage assignments"
  ON assignments FOR ALL
  TO authenticated
  USING (public.is_coordinator_or_admin());

-- ========================
-- POLÍTICAS: documents
-- ========================

CREATE POLICY "All authenticated can read documents"
  ON documents FOR SELECT
  TO authenticated
  USING (public.is_active_user());

CREATE POLICY "Authenticated users can upload documents"
  ON documents FOR INSERT
  TO authenticated
  WITH CHECK (public.is_active_user());

-- ========================
-- POLÍTICAS: imports
-- ========================

CREATE POLICY "All authenticated can read imports"
  ON imports FOR SELECT
  TO authenticated
  USING (public.is_active_user());

CREATE POLICY "Coordinator/Admin can create imports"
  ON imports FOR INSERT
  TO authenticated
  WITH CHECK (public.is_coordinator_or_admin());

CREATE POLICY "Coordinator/Admin can update imports"
  ON imports FOR UPDATE
  TO authenticated
  USING (public.is_coordinator_or_admin());

-- ========================
-- POLÍTICAS: import_row_errors
-- ========================

CREATE POLICY "All authenticated can read import errors"
  ON import_row_errors FOR SELECT
  TO authenticated
  USING (public.is_active_user());

CREATE POLICY "System can insert import errors"
  ON import_row_errors FOR INSERT
  TO authenticated
  WITH CHECK (public.is_coordinator_or_admin());

-- ========================
-- POLÍTICAS: event_logs
-- ========================

CREATE POLICY "All authenticated can read event logs"
  ON event_logs FOR SELECT
  TO authenticated
  USING (public.is_active_user());

CREATE POLICY "Authenticated can insert event logs"
  ON event_logs FOR INSERT
  TO authenticated
  WITH CHECK (public.is_active_user());

-- ========================
-- POLÍTICAS: catalogo_subestados
-- ========================

CREATE POLICY "All authenticated can read catalogo"
  ON catalogo_subestados FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can manage catalogo"
  ON catalogo_subestados FOR ALL
  TO authenticated
  USING (public.is_admin());

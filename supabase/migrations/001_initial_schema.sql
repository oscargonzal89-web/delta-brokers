-- ============================================================
-- Delta Brokers Credit Ops — Migración 001: Schema Inicial
-- Basado en PRD v1.0 §10 Modelo de datos
-- Supabase Project: hwjiasyyqfpalsufjuai
-- ============================================================

-- ========================
-- TIPOS ENUMERADOS
-- ========================

CREATE TYPE etapa_macro AS ENUM (
  'preaprobacion',
  'aprobacion',
  'legalizacion',
  'desembolsado'
);

CREATE TYPE tipo_documento AS ENUM (
  'carta_preaprobacion',
  'carta_aprobacion'
);

CREATE TYPE tipo_evento AS ENUM (
  'STATUS_CHANGED',
  'BANK_CHANGED',
  'ASSIGNMENT_CHANGED',
  'DOC_UPLOADED',
  'IMPORTED_CREATED',
  'IMPORTED_UPDATED',
  'COMMENT_ADDED'
);

CREATE TYPE rol_usuario AS ENUM (
  'analista',
  'coordinador',
  'administrador'
);

CREATE TYPE import_status AS ENUM (
  'processing',
  'completed',
  'failed'
);

-- ========================
-- TABLA: user_profiles
-- Extiende auth.users con rol y metadata de negocio
-- ========================

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  rol rol_usuario NOT NULL DEFAULT 'analista',
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_profiles_rol ON user_profiles(rol);
CREATE INDEX idx_user_profiles_activo ON user_profiles(activo);

-- ========================
-- TABLA: projects
-- PRD §10.1 — Proyecto / Sala de ventas
-- ========================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ciudad TEXT NOT NULL,
  nombre TEXT NOT NULL,
  banco_financiador_principal TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_projects_ciudad ON projects(ciudad);

-- ========================
-- TABLA: persons
-- PRD §10.1 — Cliente (persona natural)
-- Separada de Case para soportar multi-proyecto
-- ========================

CREATE TABLE persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cedula TEXT UNIQUE NOT NULL,
  nombres TEXT NOT NULL,
  apellidos TEXT NOT NULL,
  fecha_nacimiento DATE,
  ciudad_cliente TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_persons_cedula ON persons(cedula);

-- ========================
-- TABLA: cases
-- PRD §10.1 — Caso de financiación (cliente dentro de un proyecto)
-- fecha_vencimiento es columna GENERATED
-- ========================

CREATE TABLE cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES persons(id) ON DELETE CASCADE,

  -- Estado
  etapa_macro etapa_macro NOT NULL DEFAULT 'preaprobacion',
  subestado TEXT NOT NULL DEFAULT 'Cliente no contesta',

  -- Financiero
  banco_actual TEXT NOT NULL,
  ciudad_inmueble TEXT,
  monto_inmueble NUMERIC(15, 2),
  monto_a_financiar NUMERIC(15, 2),
  monto_aprobado NUMERIC(15, 2),
  monto_desembolsado NUMERIC(15, 2),

  -- Vencimiento (PRD §7.5 / §12.1)
  fecha_carta_aprobacion DATE,
  vigencia_dias INTEGER,
  fecha_vencimiento DATE GENERATED ALWAYS AS (
    fecha_carta_aprobacion + vigencia_dias
  ) STORED,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE(project_id, person_id)
);

-- Índices PRD §10.2
CREATE INDEX idx_cases_project_person ON cases(project_id, person_id);
CREATE INDEX idx_cases_project_etapa ON cases(project_id, etapa_macro, subestado);
CREATE INDEX idx_cases_project_banco ON cases(project_id, banco_actual);
CREATE INDEX idx_cases_project_vencimiento ON cases(project_id, fecha_vencimiento);
CREATE INDEX idx_cases_etapa ON cases(etapa_macro);
CREATE INDEX idx_cases_banco ON cases(banco_actual);

-- ========================
-- TABLA: assignments
-- PRD §10.1 — Asignaciones de analistas por caso
-- ========================

CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL UNIQUE REFERENCES cases(id) ON DELETE CASCADE,
  analista_delta_id UUID REFERENCES user_profiles(id),
  analista_radicacion_id UUID REFERENCES user_profiles(id),
  analista_legalizacion_id UUID REFERENCES user_profiles(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_assignments_analista_delta ON assignments(analista_delta_id);
CREATE INDEX idx_assignments_case ON assignments(case_id);

-- ========================
-- TABLA: documents
-- PRD §10.1 — Documentos (cartas de preaprobación y aprobación)
-- ========================

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  tipo tipo_documento NOT NULL,
  file_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  fecha_carta DATE,
  vigencia_dias INTEGER,
  uploaded_by UUID REFERENCES user_profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_case ON documents(case_id);
CREATE INDEX idx_documents_tipo ON documents(case_id, tipo);

-- ========================
-- TABLA: imports
-- PRD §10.1 — Registro de importaciones Excel
-- ========================

CREATE TABLE imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_url TEXT,
  file_name TEXT NOT NULL,
  uploaded_by UUID REFERENCES user_profiles(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  inserted_count INTEGER NOT NULL DEFAULT 0,
  updated_count INTEGER NOT NULL DEFAULT 0,
  error_count INTEGER NOT NULL DEFAULT 0,
  status import_status NOT NULL DEFAULT 'processing'
);

CREATE INDEX idx_imports_project ON imports(project_id);
CREATE INDEX idx_imports_date ON imports(uploaded_at DESC);

-- ========================
-- TABLA: import_row_errors
-- PRD §10.1 — Errores por fila de importación
-- ========================

CREATE TABLE import_row_errors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  import_id UUID NOT NULL REFERENCES imports(id) ON DELETE CASCADE,
  row_number INTEGER NOT NULL,
  field TEXT NOT NULL,
  message TEXT NOT NULL,
  raw_value TEXT
);

CREATE INDEX idx_import_errors_import ON import_row_errors(import_id);

-- ========================
-- TABLA: event_logs
-- PRD §10.1 — Auditoría de eventos (NFR-02)
-- ========================

CREATE TABLE event_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  event_type tipo_evento NOT NULL,
  payload JSONB NOT NULL DEFAULT '{}',
  comment TEXT,
  actor_user_id UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_event_logs_case ON event_logs(case_id);
CREATE INDEX idx_event_logs_type ON event_logs(event_type);
CREATE INDEX idx_event_logs_date ON event_logs(created_at DESC);
CREATE INDEX idx_event_logs_actor ON event_logs(actor_user_id);

-- ========================
-- TABLA: catalogo_subestados
-- Catálogo de subestados válidos por etapa (PRD §6.2)
-- ========================

CREATE TABLE catalogo_subestados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  etapa_macro etapa_macro NOT NULL,
  nombre TEXT NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  activo BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(etapa_macro, nombre)
);

-- ========================
-- TRIGGER: updated_at automático
-- ========================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_cases_updated_at
  BEFORE UPDATE ON cases
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

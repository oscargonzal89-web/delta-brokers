-- ============================================================
-- Delta Brokers Credit Ops — Migración 003: Funciones y Triggers
-- PRD §6.3 Reglas de transición, §7.5 Vencimientos, §12 Lógica de negocio
-- ============================================================

-- ========================
-- TRIGGER: Auditoría de cambio de estado (etapa/subestado)
-- PRD §12 / FR-12
-- ========================

CREATE OR REPLACE FUNCTION log_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.etapa_macro IS DISTINCT FROM NEW.etapa_macro
     OR OLD.subestado IS DISTINCT FROM NEW.subestado THEN
    INSERT INTO event_logs (case_id, event_type, payload, actor_user_id)
    VALUES (
      NEW.id,
      'STATUS_CHANGED',
      jsonb_build_object(
        'from_etapa', OLD.etapa_macro::TEXT,
        'to_etapa', NEW.etapa_macro::TEXT,
        'from_subestado', OLD.subestado,
        'to_subestado', NEW.subestado
      ),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_cases_status_change
  AFTER UPDATE ON cases
  FOR EACH ROW
  WHEN (OLD.etapa_macro IS DISTINCT FROM NEW.etapa_macro
     OR OLD.subestado IS DISTINCT FROM NEW.subestado)
  EXECUTE FUNCTION log_status_change();

-- ========================
-- TRIGGER: Auditoría de cambio de banco
-- PRD §12.2 / FR-13
-- ========================

CREATE OR REPLACE FUNCTION log_bank_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.banco_actual IS DISTINCT FROM NEW.banco_actual THEN
    INSERT INTO event_logs (case_id, event_type, payload, actor_user_id)
    VALUES (
      NEW.id,
      'BANK_CHANGED',
      jsonb_build_object(
        'from_banco', OLD.banco_actual,
        'to_banco', NEW.banco_actual
      ),
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_cases_bank_change
  AFTER UPDATE ON cases
  FOR EACH ROW
  WHEN (OLD.banco_actual IS DISTINCT FROM NEW.banco_actual)
  EXECUTE FUNCTION log_bank_change();

-- ========================
-- TRIGGER: Auditoría de cambio de asignaciones
-- FR-11
-- ========================

CREATE OR REPLACE FUNCTION log_assignment_change()
RETURNS TRIGGER AS $$
DECLARE
  changes JSONB := '{}';
BEGIN
  IF OLD.analista_delta_id IS DISTINCT FROM NEW.analista_delta_id THEN
    changes := changes || jsonb_build_object(
      'analista_delta_from', OLD.analista_delta_id,
      'analista_delta_to', NEW.analista_delta_id
    );
  END IF;

  IF OLD.analista_radicacion_id IS DISTINCT FROM NEW.analista_radicacion_id THEN
    changes := changes || jsonb_build_object(
      'analista_radicacion_from', OLD.analista_radicacion_id,
      'analista_radicacion_to', NEW.analista_radicacion_id
    );
  END IF;

  IF OLD.analista_legalizacion_id IS DISTINCT FROM NEW.analista_legalizacion_id THEN
    changes := changes || jsonb_build_object(
      'analista_legalizacion_from', OLD.analista_legalizacion_id,
      'analista_legalizacion_to', NEW.analista_legalizacion_id
    );
  END IF;

  IF changes != '{}' THEN
    INSERT INTO event_logs (case_id, event_type, payload, actor_user_id)
    VALUES (NEW.case_id, 'ASSIGNMENT_CHANGED', changes, auth.uid());
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_assignments_change
  AFTER UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION log_assignment_change();

-- ========================
-- TRIGGER: Auditoría de upload de documento
-- FR-15, FR-16
-- ========================

CREATE OR REPLACE FUNCTION log_document_upload()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO event_logs (case_id, event_type, payload, actor_user_id)
  VALUES (
    NEW.case_id,
    'DOC_UPLOADED',
    jsonb_build_object(
      'document_id', NEW.id,
      'tipo', NEW.tipo::TEXT,
      'file_name', NEW.file_name
    ),
    NEW.uploaded_by
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_documents_upload
  AFTER INSERT ON documents
  FOR EACH ROW
  EXECUTE FUNCTION log_document_upload();

-- ========================
-- FUNCIÓN: Validar subestado pertenece a etapa
-- PRD §6.3 — Reglas de transición
-- ========================

CREATE OR REPLACE FUNCTION validate_subestado_for_etapa()
RETURNS TRIGGER AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM catalogo_subestados
    WHERE etapa_macro = NEW.etapa_macro
      AND nombre = NEW.subestado
      AND activo = true
  ) THEN
    RAISE EXCEPTION 'Subestado "%" no es válido para la etapa "%"',
      NEW.subestado, NEW.etapa_macro;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_cases_validate_subestado
  BEFORE INSERT OR UPDATE ON cases
  FOR EACH ROW
  EXECUTE FUNCTION validate_subestado_for_etapa();

-- ========================
-- FUNCIÓN RPC: Cambiar estado con comentario
-- ========================

CREATE OR REPLACE FUNCTION change_case_status(
  p_case_id UUID,
  p_etapa etapa_macro,
  p_subestado TEXT,
  p_comment TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE cases
  SET etapa_macro = p_etapa,
      subestado = p_subestado
  WHERE id = p_case_id;

  IF p_comment IS NOT NULL THEN
    UPDATE event_logs
    SET comment = p_comment
    WHERE case_id = p_case_id
      AND event_type = 'STATUS_CHANGED'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================
-- FUNCIÓN RPC: Cambiar banco con motivo
-- ========================

CREATE OR REPLACE FUNCTION change_case_bank(
  p_case_id UUID,
  p_nuevo_banco TEXT,
  p_comment TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  UPDATE cases
  SET banco_actual = p_nuevo_banco
  WHERE id = p_case_id;

  IF p_comment IS NOT NULL THEN
    UPDATE event_logs
    SET comment = p_comment
    WHERE case_id = p_case_id
      AND event_type = 'BANK_CHANGED'
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================
-- FUNCIÓN: Auto-crear user_profile al registrar usuario
-- ========================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, nombre, email, rol, activo)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.email),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'rol')::rol_usuario, 'analista'),
    true
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

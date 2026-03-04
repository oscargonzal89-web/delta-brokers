-- ============================================================
-- Delta Brokers Credit Ops — Migración 006: Supabase Storage
-- PRD §7.4 — Documentos (cartas de preaprobación y aprobación)
-- ============================================================

-- Crear bucket para documentos de casos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  10485760, -- 10MB
  ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
);

-- ========================
-- POLÍTICAS DE STORAGE
-- ========================

-- Usuarios autenticados pueden subir documentos
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

-- Usuarios autenticados pueden leer documentos
CREATE POLICY "Authenticated users can read documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'documents');

-- Coordinador/Admin pueden eliminar documentos
CREATE POLICY "Coordinator/Admin can delete documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents'
    AND public.is_coordinator_or_admin()
  );

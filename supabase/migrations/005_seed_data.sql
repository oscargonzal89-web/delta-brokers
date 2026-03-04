-- ============================================================
-- Delta Brokers Credit Ops — Migración 005: Datos Semilla
-- Catálogos de subestados por etapa (PRD §6.2), bancos, ciudades
-- ============================================================

-- ========================
-- CATÁLOGO DE SUBESTADOS POR ETAPA (PRD §6.2)
-- ========================

-- Preaprobación
INSERT INTO catalogo_subestados (etapa_macro, nombre, orden) VALUES
  ('preaprobacion', 'Cliente no contesta', 1),
  ('preaprobacion', 'Teléfono erróneo', 2),
  ('preaprobacion', 'Cliente no existe', 3),
  ('preaprobacion', 'Cliente contactado', 4),
  ('preaprobacion', 'En gestión de preaprobación', 5),
  ('preaprobacion', 'Preaprobado', 6);

-- Aprobación
INSERT INTO catalogo_subestados (etapa_macro, nombre, orden) VALUES
  ('aprobacion', 'En gestión de documentos', 1),
  ('aprobacion', 'En estudio de aprobación', 2),
  ('aprobacion', 'Crédito aprobado', 3);

-- Legalización
INSERT INTO catalogo_subestados (etapa_macro, nombre, orden) VALUES
  ('legalizacion', 'Crédito aprobado sin iniciar legalización', 1),
  ('legalizacion', 'Crédito en avalúo y estudio de títulos', 2),
  ('legalizacion', 'Crédito en firma de escritura', 3),
  ('legalizacion', 'Crédito en proceso de desembolso', 4);

-- Desembolsado
INSERT INTO catalogo_subestados (etapa_macro, nombre, orden) VALUES
  ('desembolsado', 'Desembolsado', 1);

-- ========================
-- NOTA: Bancos y ciudades
-- Se manejan como TEXT libre en fase 1 (no como tabla catálogo)
-- Referencia de valores esperados:
--   Bancos: Bancolombia, Davivienda, Banco de Bogotá, BBVA Colombia,
--           Banco Popular, Banco Occidente, Itaú
--   Ciudades: Bogotá, Medellín, Cali, Barranquilla, Cartagena, Bucaramanga
-- ========================

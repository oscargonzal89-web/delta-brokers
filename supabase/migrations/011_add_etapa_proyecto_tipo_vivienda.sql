-- Add etapa_proyecto and tipo_vivienda columns to projects table
-- Recreate v_cases_with_details and v_vencimientos_por_rango to expose new fields

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS etapa_proyecto VARCHAR(200),
  ADD COLUMN IF NOT EXISTS tipo_vivienda VARCHAR(50);

DROP VIEW IF EXISTS v_cases_with_details CASCADE;

CREATE VIEW v_cases_with_details AS
SELECT
  c.id AS case_id,
  c.project_id,
  c.person_id,
  c.etapa_macro,
  c.subestado,
  c.banco_actual,
  c.ciudad_inmueble,
  c.monto_inmueble,
  c.monto_a_financiar,
  c.monto_aprobado,
  c.monto_desembolsado,
  c.fecha_carta_aprobacion,
  c.vigencia_dias,
  c.fecha_vencimiento,
  (c.fecha_vencimiento - CURRENT_DATE) AS dias_restantes,
  c.created_at AS case_created_at,
  c.updated_at AS case_updated_at,

  p.cedula,
  p.nombres,
  p.apellidos,
  (p.nombres || ' ' || p.apellidos) AS nombre_completo,
  p.fecha_nacimiento,
  p.ciudad_cliente,

  pr.nombre AS proyecto_nombre,
  pr.ciudad AS proyecto_ciudad,
  pr.banco_financiador_principal,
  pr.etapa_proyecto,
  pr.tipo_vivienda,

  a.analista_delta_id,
  a.analista_radicacion_id,
  a.analista_legalizacion_id,

  ud.nombre AS analista_delta_nombre,
  ur.nombre AS analista_radicacion_nombre,
  ul.nombre AS analista_legalizacion_nombre

FROM cases c
  JOIN persons p ON c.person_id = p.id
  JOIN projects pr ON c.project_id = pr.id
  LEFT JOIN assignments a ON a.case_id = c.id
  LEFT JOIN user_profiles ud ON a.analista_delta_id = ud.id
  LEFT JOIN user_profiles ur ON a.analista_radicacion_id = ur.id
  LEFT JOIN user_profiles ul ON a.analista_legalizacion_id = ul.id;

CREATE VIEW v_vencimientos_por_rango AS
SELECT
  v.*,
  CASE
    WHEN v.dias_restantes <= 0 THEN 'vencido'
    WHEN v.dias_restantes BETWEEN 1 AND 15 THEN '1-15'
    WHEN v.dias_restantes BETWEEN 16 AND 30 THEN '16-30'
    WHEN v.dias_restantes BETWEEN 31 AND 60 THEN '31-60'
    WHEN v.dias_restantes > 60 THEN 'mas-60'
  END AS rango_vencimiento
FROM v_cases_with_details v
WHERE v.fecha_vencimiento IS NOT NULL;

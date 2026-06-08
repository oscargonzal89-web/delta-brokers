-- Step 2: seed subestados and extend KPI views (run after 008_add_etapa_enum_values.sql)

-- Estado Cliente
INSERT INTO catalogo_subestados (etapa_macro, nombre, orden) VALUES
  ('estado_cliente', 'No interesados', 1),
  ('estado_cliente', 'Desistidos', 2),
  ('estado_cliente', 'Aprobados otro banco', 3)
ON CONFLICT (etapa_macro, nombre) DO NOTHING;

-- Negados
INSERT INTO catalogo_subestados (etapa_macro, nombre, orden) VALUES
  ('negados', 'Negado definitivo', 1),
  ('negados', 'En subsanación radicado', 2),
  ('negados', 'En subsanación proceso de aprobación', 3)
ON CONFLICT (etapa_macro, nombre) DO NOTHING;

CREATE OR REPLACE VIEW v_dashboard_kpis AS
SELECT
  pr.id AS project_id,
  pr.nombre AS proyecto_nombre,
  pr.ciudad,
  COUNT(c.id) AS total_clientes,
  COUNT(c.id) FILTER (WHERE c.etapa_macro = 'preaprobacion') AS preaprobacion,
  COUNT(c.id) FILTER (WHERE c.etapa_macro = 'aprobacion') AS aprobacion,
  COUNT(c.id) FILTER (WHERE c.etapa_macro = 'legalizacion') AS legalizacion,
  COUNT(c.id) FILTER (WHERE c.etapa_macro = 'desembolsado') AS desembolsado,
  COUNT(c.id) FILTER (WHERE c.etapa_macro = 'estado_cliente') AS estado_cliente,
  COUNT(c.id) FILTER (WHERE c.etapa_macro = 'negados') AS negados,
  COUNT(c.id) FILTER (
    WHERE c.fecha_vencimiento IS NOT NULL
      AND (c.fecha_vencimiento - CURRENT_DATE) > 0
      AND (c.fecha_vencimiento - CURRENT_DATE) < 60
  ) AS por_vencer,
  COUNT(c.id) FILTER (
    WHERE c.fecha_vencimiento IS NOT NULL
      AND (c.fecha_vencimiento - CURRENT_DATE) <= 0
  ) AS vencidos
FROM projects pr
  LEFT JOIN cases c ON c.project_id = pr.id
GROUP BY pr.id, pr.nombre, pr.ciudad;

CREATE OR REPLACE VIEW v_seguimiento_analistas AS
SELECT
  ud.id AS analista_id,
  ud.nombre AS analista_nombre,
  pr.id AS project_id,
  pr.nombre AS proyecto_nombre,
  pr.ciudad AS proyecto_ciudad,
  COUNT(*) AS total_creditos,
  COUNT(*) FILTER (WHERE c.etapa_macro = 'preaprobacion') AS preaprobacion,
  COUNT(*) FILTER (WHERE c.etapa_macro = 'aprobacion') AS aprobacion,
  COUNT(*) FILTER (WHERE c.etapa_macro = 'legalizacion') AS legalizacion,
  COUNT(*) FILTER (WHERE c.etapa_macro = 'desembolsado') AS desembolsado,
  COUNT(*) FILTER (WHERE c.etapa_macro = 'estado_cliente') AS estado_cliente,
  COUNT(*) FILTER (WHERE c.etapa_macro = 'negados') AS negados,
  COUNT(*) FILTER (
    WHERE c.fecha_vencimiento IS NOT NULL
      AND (c.fecha_vencimiento - CURRENT_DATE) > 0
      AND (c.fecha_vencimiento - CURRENT_DATE) < 60
  ) AS por_vencer,
  COUNT(*) FILTER (
    WHERE c.fecha_vencimiento IS NOT NULL
      AND (c.fecha_vencimiento - CURRENT_DATE) <= 0
  ) AS vencidos
FROM assignments a
  JOIN cases c ON a.case_id = c.id
  JOIN projects pr ON c.project_id = pr.id
  JOIN user_profiles ud ON a.analista_delta_id = ud.id
GROUP BY ud.id, ud.nombre, pr.id, pr.nombre, pr.ciudad;

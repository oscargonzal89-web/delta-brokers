-- Fix v_dashboard_kpis: COUNT(*) counted empty projects as 1 client.
-- Use COUNT(c.id) so projects without cases report zero.

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

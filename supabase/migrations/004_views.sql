-- ============================================================
-- Delta Brokers Credit Ops — Migración 004: Vistas SQL
-- Vistas optimizadas para dashboard, vencimientos y seguimiento
-- ============================================================

-- ========================
-- VISTA: Casos con detalles completos
-- Une cases + persons + projects + assignments para queries del frontend
-- ========================

CREATE OR REPLACE VIEW v_cases_with_details AS
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

-- ========================
-- VISTA: Dashboard KPIs por proyecto
-- PRD §7.1 FR-02 — KPIs por proyecto
-- ========================

CREATE OR REPLACE VIEW v_dashboard_kpis AS
SELECT
  pr.id AS project_id,
  pr.nombre AS proyecto_nombre,
  pr.ciudad,
  COUNT(*) AS total_clientes,
  COUNT(*) FILTER (WHERE c.etapa_macro = 'preaprobacion') AS preaprobacion,
  COUNT(*) FILTER (WHERE c.etapa_macro = 'aprobacion') AS aprobacion,
  COUNT(*) FILTER (WHERE c.etapa_macro = 'legalizacion') AS legalizacion,
  COUNT(*) FILTER (WHERE c.etapa_macro = 'desembolsado') AS desembolsado,
  COUNT(*) FILTER (
    WHERE c.fecha_vencimiento IS NOT NULL
      AND (c.fecha_vencimiento - CURRENT_DATE) > 0
      AND (c.fecha_vencimiento - CURRENT_DATE) < 60
  ) AS por_vencer,
  COUNT(*) FILTER (
    WHERE c.fecha_vencimiento IS NOT NULL
      AND (c.fecha_vencimiento - CURRENT_DATE) <= 0
  ) AS vencidos
FROM projects pr
  LEFT JOIN cases c ON c.project_id = pr.id
GROUP BY pr.id, pr.nombre, pr.ciudad;

-- ========================
-- VISTA: Vencimientos por rango
-- PRD §7.5 FR-21
-- ========================

CREATE OR REPLACE VIEW v_vencimientos_por_rango AS
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

-- ========================
-- VISTA: Seguimiento por analista
-- Métricas operativas §13.2
-- ========================

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

-- ========================
-- VISTA: Conteo de subestados por proyecto
-- PRD §7.1 FR-03
-- ========================

CREATE OR REPLACE VIEW v_subestados_por_proyecto AS
SELECT
  c.project_id,
  c.etapa_macro,
  c.subestado,
  COUNT(*) AS cantidad
FROM cases c
GROUP BY c.project_id, c.etapa_macro, c.subestado
ORDER BY c.project_id, c.etapa_macro, c.subestado;

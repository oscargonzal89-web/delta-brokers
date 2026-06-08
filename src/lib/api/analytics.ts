import { supabase } from '../supabase';
import type { DashboardKpi, VencimientoPorRango, SeguimientoAnalista, CaseWithDetails, EtapaMacro } from '../types';

export interface AggregatedDashboardKpis {
  total: number;
  preaprobacion: number;
  aprobacion: number;
  legalizacion: number;
  desembolsados: number;
  estadoCliente: number;
  negados: number;
  porVencer: number;
  vencidos: number;
}

export interface DashboardFilters {
  projectId?: string;
  ciudad?: string;
  banco?: string;
  analistaId?: string;
}

const EMPTY_KPIS: AggregatedDashboardKpis = {
  total: 0,
  preaprobacion: 0,
  aprobacion: 0,
  legalizacion: 0,
  desembolsados: 0,
  estadoCliente: 0,
  negados: 0,
  porVencer: 0,
  vencidos: 0,
};

/**
 * Sums per-project KPI rows from v_dashboard_kpis into global totals.
 */
export function aggregateDashboardKpis(rows: DashboardKpi[]): AggregatedDashboardKpis {
  const result = { ...EMPTY_KPIS };

  for (const row of rows) {
    result.total += row.total_clientes ?? 0;
    result.preaprobacion += row.preaprobacion ?? 0;
    result.aprobacion += row.aprobacion ?? 0;
    result.legalizacion += row.legalizacion ?? 0;
    result.desembolsados += row.desembolsado ?? 0;
    result.estadoCliente += row.estado_cliente ?? 0;
    result.negados += row.negados ?? 0;
    result.porVencer += row.por_vencer ?? 0;
    result.vencidos += row.vencidos ?? 0;
  }

  return result;
}

/**
 * Aggregates KPI counts from individual cases when case-level filters are active.
 */
function aggregateFromCases(
  cases: Pick<CaseWithDetails, 'etapa_macro' | 'dias_restantes'>[],
): AggregatedDashboardKpis {
  const result = { ...EMPTY_KPIS };

  for (const row of cases) {
    result.total += 1;

    switch (row.etapa_macro as EtapaMacro | null) {
      case 'preaprobacion':
        result.preaprobacion += 1;
        break;
      case 'aprobacion':
        result.aprobacion += 1;
        break;
      case 'legalizacion':
        result.legalizacion += 1;
        break;
      case 'desembolsado':
        result.desembolsados += 1;
        break;
      case 'estado_cliente':
        result.estadoCliente += 1;
        break;
      case 'negados':
        result.negados += 1;
        break;
      default:
        break;
    }

    const dias = row.dias_restantes;
    if (dias != null && dias > 0 && dias < 60) {
      result.porVencer += 1;
    }
    if (dias != null && dias <= 0) {
      result.vencidos += 1;
    }
  }

  return result;
}

export async function getDashboardKpis(projectId?: string) {
  let query = supabase.from('v_dashboard_kpis').select('*');

  if (projectId) query = query.eq('project_id', projectId);

  const { data, error } = await query;
  if (error) throw error;
  return data as DashboardKpi[];
}

/**
 * Returns dashboard KPI totals, using the SQL view or case-level aggregation when filtered.
 */
export async function getFilteredDashboardKpis(
  filters: DashboardFilters = {},
): Promise<AggregatedDashboardKpis> {
  const hasCaseFilters = !!(filters.ciudad || filters.banco || filters.analistaId);

  if (!hasCaseFilters) {
    const rows = await getDashboardKpis(filters.projectId);
    return aggregateDashboardKpis(rows);
  }

  let query = supabase
    .from('v_cases_with_details')
    .select('etapa_macro, dias_restantes');

  if (filters.projectId) query = query.eq('project_id', filters.projectId);
  if (filters.ciudad) query = query.eq('ciudad_inmueble', filters.ciudad);
  if (filters.banco) query = query.eq('banco_actual', filters.banco);
  if (filters.analistaId) query = query.eq('analista_delta_id', filters.analistaId);

  const { data, error } = await query;
  if (error) throw error;

  return aggregateFromCases((data ?? []) as Pick<CaseWithDetails, 'etapa_macro' | 'dias_restantes'>[]);
}

export async function getVencimientosPorRango(filters?: {
  projectId?: string;
  rango?: string;
  analistaId?: string;
}) {
  let query = supabase
    .from('v_vencimientos_por_rango')
    .select('*')
    .order('dias_restantes', { ascending: true });

  if (filters?.projectId) query = query.eq('project_id', filters.projectId);
  if (filters?.rango) query = query.eq('rango_vencimiento', filters.rango);
  if (filters?.analistaId) query = query.eq('analista_delta_id', filters.analistaId);

  const { data, error } = await query;
  if (error) throw error;
  return data as VencimientoPorRango[];
}

export async function getSeguimientoAnalistas(filters?: {
  analistaId?: string;
  projectId?: string;
  ciudad?: string;
}) {
  let query = supabase.from('v_seguimiento_analistas').select('*');

  if (filters?.analistaId) query = query.eq('analista_id', filters.analistaId);
  if (filters?.projectId) query = query.eq('project_id', filters.projectId);
  if (filters?.ciudad) query = query.eq('proyecto_ciudad', filters.ciudad);

  const { data, error } = await query.order('analista_nombre');
  if (error) throw error;
  return data as SeguimientoAnalista[];
}

export async function getTopPorVencer(limit = 10, filters: DashboardFilters = {}) {
  let query = supabase
    .from('v_cases_with_details')
    .select('*')
    .not('fecha_vencimiento', 'is', null)
    .lte('dias_restantes', 60)
    .order('dias_restantes', { ascending: true })
    .limit(limit);

  if (filters.projectId) query = query.eq('project_id', filters.projectId);
  if (filters.ciudad) query = query.eq('ciudad_inmueble', filters.ciudad);
  if (filters.banco) query = query.eq('banco_actual', filters.banco);
  if (filters.analistaId) query = query.eq('analista_delta_id', filters.analistaId);

  const { data, error } = await query;
  if (error) throw error;
  return data as CaseWithDetails[];
}

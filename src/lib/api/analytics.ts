import { supabase } from '../supabase';
import type { DashboardKpi, VencimientoPorRango, SeguimientoAnalista, CaseWithDetails } from '../types';

export async function getDashboardKpis(projectId?: string) {
  let query = supabase.from('v_dashboard_kpis').select('*');

  if (projectId) query = query.eq('project_id', projectId);

  const { data, error } = await query;
  if (error) throw error;
  return data as DashboardKpi[];
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

export async function getTopPorVencer(limit = 10, projectId?: string) {
  let query = supabase
    .from('v_cases_with_details')
    .select('*')
    .not('fecha_vencimiento', 'is', null)
    .gt('dias_restantes', 0)
    .order('dias_restantes', { ascending: true })
    .limit(limit);

  if (projectId) query = query.eq('project_id', projectId);

  const { data, error } = await query;
  if (error) throw error;
  return data as CaseWithDetails[];
}

export async function getVencimientosCriticos(diasUmbral = 15) {
  const { count, error } = await supabase
    .from('v_cases_with_details')
    .select('*', { count: 'exact', head: true })
    .not('fecha_vencimiento', 'is', null)
    .lte('dias_restantes', diasUmbral)
    .gt('dias_restantes', 0);

  if (error) throw error;
  return count ?? 0;
}

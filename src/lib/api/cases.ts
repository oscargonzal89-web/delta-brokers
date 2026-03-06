import { supabase } from '../supabase';
import type { CaseWithDetails, EtapaMacro, CatalogoSubestado } from '../types';

export interface CaseFilters {
  projectId?: string;
  etapaMacro?: EtapaMacro;
  subestado?: string;
  bancoActual?: string;
  ciudadInmueble?: string;
  analistaId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export async function getCases(filters: CaseFilters = {}): Promise<PaginatedResult<CaseWithDetails>> {
  const { page = 1, pageSize = 50 } = filters;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from('v_cases_with_details')
    .select('*', { count: 'exact' });

  if (filters.projectId) query = query.eq('project_id', filters.projectId);
  if (filters.etapaMacro) query = query.eq('etapa_macro', filters.etapaMacro);
  if (filters.subestado) query = query.eq('subestado', filters.subestado);
  if (filters.bancoActual) query = query.eq('banco_actual', filters.bancoActual);
  if (filters.ciudadInmueble) query = query.eq('ciudad_inmueble', filters.ciudadInmueble);
  if (filters.analistaId) query = query.eq('analista_delta_id', filters.analistaId);
  if (filters.search) {
    query = query.or(
      `nombre_completo.ilike.%${filters.search}%,cedula.ilike.%${filters.search}%`
    );
  }

  const { data, error, count } = await query
    .order('case_updated_at', { ascending: false })
    .range(from, to);

  if (error) throw error;

  return {
    data: (data ?? []) as CaseWithDetails[],
    count: count ?? 0,
    page,
    pageSize,
    totalPages: Math.ceil((count ?? 0) / pageSize),
  };
}

export async function getCaseById(caseId: string) {
  const { data, error } = await supabase
    .from('v_cases_with_details')
    .select('*')
    .eq('case_id', caseId)
    .single();

  if (error) throw error;
  return data as CaseWithDetails;
}

export async function changeCaseStatus(
  caseId: string,
  etapa: EtapaMacro,
  subestado: string,
  comment?: string
) {
  const { error } = await supabase.rpc('change_case_status', {
    p_case_id: caseId,
    p_etapa: etapa,
    p_subestado: subestado,
    p_comment: comment,
  });

  if (error) throw error;
}

export async function changeCaseBank(
  caseId: string,
  nuevoBanco: string,
  comment?: string
) {
  const { error } = await supabase.rpc('change_case_bank', {
    p_case_id: caseId,
    p_nuevo_banco: nuevoBanco,
    p_comment: comment,
  });

  if (error) throw error;
}

export async function updateAssignment(
  caseId: string,
  assignments: {
    analista_delta_id?: string | null;
    analista_radicacion_id?: string | null;
    analista_legalizacion_id?: string | null;
  }
) {
  const { data: existing } = await supabase
    .from('assignments')
    .select('id')
    .eq('case_id', caseId)
    .single();

  if (existing) {
    const { error } = await supabase
      .from('assignments')
      .update(assignments)
      .eq('case_id', caseId);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from('assignments')
      .insert({ case_id: caseId, ...assignments });
    if (error) throw error;
  }
}

export async function getCaseEventLogs(caseId: string) {
  const { data, error } = await supabase
    .from('event_logs')
    .select('*, actor:user_profiles!event_logs_actor_user_id_fkey(nombre)')
    .eq('case_id', caseId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getSubestados(etapaMacro?: EtapaMacro) {
  let query = supabase
    .from('catalogo_subestados')
    .select('*')
    .eq('activo', true)
    .order('orden');

  if (etapaMacro) query = query.eq('etapa_macro', etapaMacro);

  const { data, error } = await query;
  if (error) throw error;
  return data as CatalogoSubestado[];
}

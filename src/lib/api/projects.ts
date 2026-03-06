import { supabase } from '../supabase';
import type { Project, DashboardKpi, SubestadoPorProyecto, TablesInsert } from '../types';

export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('nombre');

  if (error) throw error;
  return data as Project[];
}

export async function getProjectById(id: string) {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Project;
}

export async function createProject(project: TablesInsert<'projects'>) {
  const { data, error } = await supabase
    .from('projects')
    .insert(project)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Project>) {
  const { data, error } = await supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Project;
}

export async function getProjectKpis(projectId?: string) {
  let query = supabase.from('v_dashboard_kpis').select('*');

  if (projectId) {
    query = query.eq('project_id', projectId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as DashboardKpi[];
}

export async function getSubestadosPorProyecto(projectId: string) {
  const { data, error } = await supabase
    .from('v_subestados_por_proyecto')
    .select('*')
    .eq('project_id', projectId);

  if (error) throw error;
  return data as SubestadoPorProyecto[];
}

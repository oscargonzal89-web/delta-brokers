import { supabase } from '../supabase';
import type { Import, ImportRowError } from '../types';

export async function getImports(projectId?: string) {
  let query = supabase
    .from('imports')
    .select('*, project:projects(nombre)')
    .order('uploaded_at', { ascending: false });

  if (projectId) query = query.eq('project_id', projectId);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getImportById(importId: string) {
  const { data, error } = await supabase
    .from('imports')
    .select('*, project:projects(nombre)')
    .eq('id', importId)
    .single();

  if (error) throw error;
  return data;
}

export async function getImportErrors(importId: string) {
  const { data, error } = await supabase
    .from('import_row_errors')
    .select('*')
    .eq('import_id', importId)
    .order('row_number');

  if (error) throw error;
  return data as ImportRowError[];
}

export async function uploadExcel(projectId: string, file: File) {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const session = (await supabase.auth.getSession()).data.session;

  if (!session) throw new Error('No authenticated session');

  const formData = new FormData();
  formData.append('file', file);
  formData.append('project_id', projectId);

  const response = await fetch(
    `${supabaseUrl}/functions/v1/import-excel`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Error al importar archivo');
  }

  return (await response.json()) as Import;
}

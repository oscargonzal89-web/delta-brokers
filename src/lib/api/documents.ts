import { supabase } from '../supabase';
import type { Document, TipoDocumento, TablesInsert } from '../types';

export async function getDocumentsByCase(caseId: string) {
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('case_id', caseId)
    .order('uploaded_at', { ascending: false });

  if (error) throw error;
  return data as Document[];
}

export async function uploadDocument(
  caseId: string,
  file: File,
  tipo: TipoDocumento,
  metadata?: { fecha_carta?: string; vigencia_dias?: number }
) {
  const filePath = `${caseId}/${tipo}/${Date.now()}_${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('documents')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: urlData } = supabase.storage
    .from('documents')
    .getPublicUrl(filePath);

  const docRecord: TablesInsert<'documents'> = {
    case_id: caseId,
    tipo,
    file_url: filePath,
    file_name: file.name,
    fecha_carta: metadata?.fecha_carta ?? null,
    vigencia_dias: metadata?.vigencia_dias ?? null,
  };

  const { data, error } = await supabase
    .from('documents')
    .insert(docRecord)
    .select()
    .single();

  if (error) throw error;

  if (tipo === 'carta_aprobacion' && metadata?.fecha_carta && metadata?.vigencia_dias) {
    await supabase
      .from('cases')
      .update({
        fecha_carta_aprobacion: metadata.fecha_carta,
        vigencia_dias: metadata.vigencia_dias,
      })
      .eq('id', caseId);
  }

  return data as Document;
}

export async function downloadDocument(filePath: string) {
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl(filePath, 3600);

  if (error) throw error;
  return data.signedUrl;
}

export async function deleteDocument(documentId: string, filePath: string) {
  const { error: storageError } = await supabase.storage
    .from('documents')
    .remove([filePath]);

  if (storageError) throw storageError;

  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId);

  if (error) throw error;
}

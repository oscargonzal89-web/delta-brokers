import { supabase } from '../supabase';
import type { UserProfile, RolUsuario } from '../types';

export async function getUsers() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .order('nombre');

  if (error) throw error;
  return data as UserProfile[];
}

export async function getAnalistas() {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, nombre, rol')
    .eq('activo', true)
    .in('rol', ['analista', 'coordinador', 'administrador'])
    .order('nombre');

  if (error) throw error;
  return data;
}

export async function getUserById(id: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function updateUserRole(userId: string, rol: RolUsuario) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ rol })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function toggleUserActive(userId: string, activo: boolean) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ activo })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

export async function updateUserProfile(userId: string, updates: { nombre?: string; email?: string }) {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data as UserProfile;
}

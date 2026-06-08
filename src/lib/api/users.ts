import { supabase } from '../supabase';
import type { UserProfile, RolUsuario } from '../types';

export interface CreateUserInput {
  email: string;
  nombre: string;
  rol: RolUsuario;
  password: string;
}

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

export async function createUser(input: CreateUserInput): Promise<UserProfile> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No authenticated session');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'create', ...input }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error creating user');
  return json as UserProfile;
}

export async function deleteUser(userId: string): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('No authenticated session');

  const res = await fetch(
    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-user`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: 'delete', user_id: userId }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Error deleting user');
}

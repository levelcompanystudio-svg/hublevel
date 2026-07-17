import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type { UserStatus } from '../auth/auth.types';
import type { CreateUserValues, ManagedProfile, RoleOption } from './settings.types';

const profileSelect = `
  id,
  role_id,
  name,
  email,
  status,
  created_at,
  roles(name)
`;

export async function listProfiles(): Promise<ManagedProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select(profileSelect)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as unknown as ManagedProfile[];
}

export async function listRoles(): Promise<RoleOption[]> {
  const { data, error } = await supabase
    .from('roles')
    .select('id, name, description')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as RoleOption[];
}

export async function updateProfileRole(profileId: string, roleId: string): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ role_id: roleId })
    .eq('id', profileId);

  if (error) throw error;
}

export async function updateProfileStatus(profileId: string, status: UserStatus): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ status })
    .eq('id', profileId);

  if (error) throw error;
}

export async function updateOwnName(profileId: string, name: string): Promise<void> {
  const trimmed = name.trim();
  if (!trimmed) throw new Error('Informe um nome valido.');

  const { error } = await supabase
    .from('profiles')
    .update({ name: trimmed })
    .eq('id', profileId);

  if (error) throw error;
}

interface CreateUserResponse {
  profile?: ManagedProfile;
  error?: string;
}

export async function createUser(values: CreateUserValues): Promise<ManagedProfile> {
  const { data, error } = await supabase.functions.invoke<CreateUserResponse>('create-app-user', {
    body: {
      name: values.name.trim(),
      email: values.email.trim(),
      password: values.password,
    },
  });

  if (error) {
    let message = error.message || 'Erro ao cadastrar usuario.';
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      if (body?.error) message = body.error;
    }
    throw new Error(message);
  }

  if (!data?.profile) {
    throw new Error(data?.error || 'Resposta invalida ao cadastrar usuario.');
  }

  return data.profile;
}

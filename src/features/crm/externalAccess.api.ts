import { FunctionsHttpError } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase';
import type {
  CreateExternalUserInput,
  ExternalMembership,
  ExternalMembershipRole,
  ExternalMembershipStatus,
  ExternalProfileSearchResult,
  LinkExistingExternalUserInput,
} from './externalAccess.types';

// Camada de dados da secao "Acesso do cliente" (aba CRM, Etapa 9). Leitura/edicao de
// client_user_memberships usa o client supabase-js normal - a RLS das migrations 031/032 ja
// restringe admin (qualquer cliente) e gestor (somente clientes onde
// clients.responsible_user_id = auth.uid()), entao nenhuma logica de permissao e duplicada aqui.
// Criar um usuario externo novo (Auth + profile_type='external') exige a service role key, que
// nunca fica no frontend - isso vai para a Edge Function create-external-client-user.

const membershipSelect = `
  id,
  client_id,
  profile_id,
  membership_role,
  status,
  can_view_all_opportunities,
  created_at,
  profile:profiles!client_user_memberships_profile_id_fkey(id, name, email, status)
`;

function throwExternalAccessError(error: { message?: string } | null, fallback: string): never {
  throw new Error(error?.message || fallback);
}

function sanitizeProfileSearchQuery(query: string) {
  return query
    .trim()
    .replace(/[%,()]/g, ' ')
    .replace(/\s+/g, ' ');
}

export async function listClientExternalMemberships(clientId: string): Promise<ExternalMembership[]> {
  const { data, error } = await supabase
    .from('client_user_memberships')
    .select(membershipSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) throwExternalAccessError(error, 'Erro ao carregar os usuarios externos vinculados.');
  return (data ?? []) as unknown as ExternalMembership[];
}

// Busca profiles externos ativos por nome/e-mail, para o fluxo "vincular usuario existente".
// Nao filtra por cliente aqui - a UI descarta da lista quem ja aparece em listClientExternalMemberships.
export async function searchExternalProfiles(query: string): Promise<ExternalProfileSearchResult[]> {
  const trimmed = sanitizeProfileSearchQuery(query);
  if (trimmed.length < 3) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select('id, name, email')
    .eq('profile_type', 'external')
    .eq('status', 'active')
    .is('deleted_at', null)
    .or(`name.ilike.%${trimmed}%,email.ilike.%${trimmed}%`)
    .order('name', { ascending: true })
    .limit(8);

  if (error) throwExternalAccessError(error, 'Erro ao buscar usuarios externos.');
  return (data ?? []) as ExternalProfileSearchResult[];
}

export async function linkExistingExternalUser(
  input: LinkExistingExternalUserInput,
  userId: string,
): Promise<ExternalMembership> {
  const { data, error } = await supabase
    .from('client_user_memberships')
    .insert({
      client_id: input.client_id,
      profile_id: input.profile_id,
      membership_role: input.membership_role,
      status: 'active',
      created_by: userId,
      updated_by: userId,
    })
    .select(membershipSelect)
    .single();

  if (error) throwExternalAccessError(error, 'Erro ao vincular o usuario externo a este cliente.');
  return data as unknown as ExternalMembership;
}

export async function updateExternalMembershipRole(
  membershipId: string,
  membershipRole: ExternalMembershipRole,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('client_user_memberships')
    .update({ membership_role: membershipRole, updated_by: userId })
    .eq('id', membershipId)
    .is('deleted_at', null);

  if (error) throwExternalAccessError(error, 'Erro ao atualizar o papel do vinculo.');
}

export async function updateExternalMembershipStatus(
  membershipId: string,
  status: ExternalMembershipStatus,
  userId: string,
): Promise<void> {
  const { error } = await supabase
    .from('client_user_memberships')
    .update({ status, updated_by: userId })
    .eq('id', membershipId)
    .is('deleted_at', null);

  if (error) throwExternalAccessError(error, 'Erro ao atualizar o status do vinculo.');
}

interface CreateExternalClientUserResponse {
  profile?: { id: string; name: string; email: string; status: string; profile_type: string };
  membership?: ExternalMembership;
  error?: string;
}

export async function createExternalClientUser(input: CreateExternalUserInput): Promise<ExternalMembership> {
  const { data, error } = await supabase.functions.invoke<CreateExternalClientUserResponse>(
    'create-external-client-user',
    {
      body: {
        name: input.name.trim(),
        email: input.email.trim(),
        password: input.password,
        client_id: input.client_id,
        membership_role: input.membership_role,
      },
    },
  );

  if (error) {
    let message = error.message || 'Erro ao criar usuario externo.';
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      if (body?.error) message = body.error;
    }
    throw new Error(message);
  }

  if (!data?.membership) {
    throw new Error(data?.error || 'Resposta invalida ao criar usuario externo.');
  }

  return data.membership;
}

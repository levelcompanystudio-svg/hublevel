import { supabaseAdmin } from '../../lib/supabaseAdmin.js';
import type { ConnectionStatusValue } from './types.js';
import type { ProviderDbCode } from './providerDbCode.js';

export interface ClientIntegrationRow {
  id: string;
  client_id: string;
  provider: ProviderDbCode;
  status: ConnectionStatusValue;
  external_account_id: string | null;
  external_account_name: string | null;
  currency_code: string | null;
  timezone: string | null;
  last_sync_at: string | null;
  last_success_at: string | null;
  last_error_code: string | null;
  last_error_at: string | null;
  error_message: string | null;
}

const CONNECTION_SELECT =
  'id, client_id, provider, status, external_account_id, external_account_name, currency_code, timezone, last_sync_at, last_success_at, last_error_code, last_error_at, error_message';

export async function getClientIntegrationById(id: string): Promise<ClientIntegrationRow | null> {
  const { data, error } = await supabaseAdmin
    .from('client_integrations')
    .select(CONNECTION_SELECT)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  return (data as ClientIntegrationRow | null) ?? null;
}

interface UpsertMetaConnectionInput {
  clientId: string;
  externalAccountId: string;
  externalAccountName: string | null;
  currencyCode: string | null;
  timezone: string | null;
  actorId: string;
}

// Uma conexao por (client_id, provider) - ja garantido pelo indice unico
// idx_client_integrations_one_active_per_client_provider (migration 022). Aqui fazemos
// select-then-insert/update explicito em vez de upsert generico porque o "on conflict" dessa
// tabela e um indice parcial (where deleted_at is null), que o upsert do PostgREST nao endereca
// diretamente por nome de coluna.
export async function upsertMetaConnection(input: UpsertMetaConnectionInput): Promise<ClientIntegrationRow> {
  const { data: existing, error: lookupError } = await supabaseAdmin
    .from('client_integrations')
    .select('id')
    .eq('client_id', input.clientId)
    .eq('provider', 'meta_ads')
    .is('deleted_at', null)
    .maybeSingle();

  if (lookupError) throw lookupError;

  const basePayload = {
    external_account_id: input.externalAccountId,
    external_account_name: input.externalAccountName,
    currency_code: input.currencyCode,
    timezone: input.timezone,
    status: 'connected' as ConnectionStatusValue,
    error_message: null,
    last_error_code: null,
    last_error_at: null,
    updated_by: input.actorId,
  };

  if (existing) {
    const { data, error } = await supabaseAdmin
      .from('client_integrations')
      .update(basePayload)
      .eq('id', existing.id)
      .select(CONNECTION_SELECT)
      .single();

    if (error) throw error;
    return data as ClientIntegrationRow;
  }

  const { data, error } = await supabaseAdmin
    .from('client_integrations')
    .insert({
      client_id: input.clientId,
      provider: 'meta_ads',
      ...basePayload,
      created_by: input.actorId,
    })
    .select(CONNECTION_SELECT)
    .single();

  if (error) throw error;
  return data as ClientIntegrationRow;
}

export async function markSyncSuccess(id: string, actorId: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('client_integrations')
    .update({
      status: 'connected',
      last_sync_at: now,
      last_success_at: now,
      last_error_code: null,
      last_error_at: null,
      error_message: null,
      updated_by: actorId,
    })
    .eq('id', id);

  if (error) throw error;
}

export async function markSyncError(id: string, actorId: string, errorCode: string, errorMessage: string): Promise<void> {
  const now = new Date().toISOString();
  const { error } = await supabaseAdmin
    .from('client_integrations')
    .update({
      status: 'error',
      last_sync_at: now,
      last_error_code: errorCode,
      last_error_at: now,
      error_message: errorMessage,
      updated_by: actorId,
    })
    .eq('id', id);

  if (error) throw error;
}

interface InsertSyncLogInput {
  clientIntegrationId: string;
  clientId: string;
  provider: ProviderDbCode;
  status: 'success' | 'failed';
  message: string | null;
  errorMessage: string | null;
  metadata: Record<string, unknown>;
  actorId: string;
}

export async function insertSyncLog(input: InsertSyncLogInput): Promise<void> {
  const { error } = await supabaseAdmin.from('integration_sync_logs').insert({
    client_integration_id: input.clientIntegrationId,
    client_id: input.clientId,
    provider: input.provider,
    status: input.status,
    finished_at: new Date().toISOString(),
    message: input.message,
    error_message: input.errorMessage,
    metadata: input.metadata,
    created_by: input.actorId,
  });

  if (error) throw error;
}

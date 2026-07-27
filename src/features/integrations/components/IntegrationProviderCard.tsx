import { useState } from 'react';
import { Button, Card } from '../../../components/ui';
import { createMetaConnection, listAvailableMetaAdAccounts, syncClientIntegration } from '../integrations.api';
import type { ClientIntegration, MetaAdAccountOption } from '../integrations.types';
import { integrationDescriptions, integrationLabels, integrationMonograms } from '../integrations.types';
import { IntegrationStatusBadge } from './IntegrationStatusBadge';

interface IntegrationProviderCardProps {
  integration: ClientIntegration;
  isAdmin: boolean;
  onChanged: () => void;
}

function formatDateTime(value: string | null): string {
  if (!value) return 'Nunca';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function IntegrationProviderCard({ integration, isAdmin, onChanged }: IntegrationProviderCardProps) {
  const { provider, status } = integration;
  const isMeta = provider === 'meta_ads';

  const [pickingAccount, setPickingAccount] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [accounts, setAccounts] = useState<MetaAdAccountOption[] | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState('');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleStartConnect() {
    setActionError(null);
    setPickingAccount(true);
    if (accounts) return;

    try {
      setLoadingAccounts(true);
      const result = await listAvailableMetaAdAccounts();
      setAccounts(result);
      setSelectedAccountId(result[0]?.id ?? '');
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erro ao listar contas Meta Ads.');
    } finally {
      setLoadingAccounts(false);
    }
  }

  async function handleConfirmConnect() {
    if (!selectedAccountId) return;
    try {
      setBusy(true);
      setActionError(null);
      await createMetaConnection(integration.client_id, selectedAccountId);
      setPickingAccount(false);
      onChanged();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erro ao vincular conta Meta Ads.');
    } finally {
      setBusy(false);
    }
  }

  async function handleSync() {
    if (!integration.id) return;
    try {
      setBusy(true);
      setActionError(null);
      await syncClientIntegration(integration.id);
      onChanged();
    } catch (err: unknown) {
      setActionError(err instanceof Error ? err.message : 'Erro ao sincronizar integracao.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface text-sm font-bold text-muted-foreground">
            {integrationMonograms[provider]}
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">{integrationLabels[provider]}</p>
            <IntegrationStatusBadge status={status} />
          </div>
        </div>
      </div>

      <p className="text-xs leading-5 text-muted-foreground">{integrationDescriptions[provider]}</p>

      <dl className="space-y-1.5 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-2">
          <dt>Conta externa</dt>
          <dd className="font-medium text-foreground">{integration.external_account_name ?? 'Nao configurada'}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt>Ultimo sync com sucesso</dt>
          <dd className="font-medium text-foreground">{formatDateTime(integration.last_success_at)}</dd>
        </div>
        {integration.last_error_at && (
          <div className="flex items-center justify-between gap-2">
            <dt>Ultimo erro</dt>
            <dd className="font-medium text-destructive">
              {formatDateTime(integration.last_error_at)} {integration.last_error_code ? `(${integration.last_error_code})` : ''}
            </dd>
          </div>
        )}
      </dl>

      {integration.error_message && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {integration.error_message}
        </p>
      )}
      {actionError && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {actionError}
        </p>
      )}

      {!isMeta ? (
        <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border pt-3">
          <Button type="button" variant="secondary" disabled aria-label="Preparado" title="Google Ads: integracao real ainda nao implementada">
            Preparado - em breve
          </Button>
        </div>
      ) : !isAdmin ? (
        <p className="mt-auto border-t border-border pt-3 text-xs text-muted-foreground">
          Apenas administradores podem conectar ou sincronizar esta integracao.
        </p>
      ) : (
        <div className="mt-auto flex flex-col gap-3 border-t border-border pt-3">
          {pickingAccount && (
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-surface/60 p-3">
              {loadingAccounts ? (
                <p className="text-xs text-muted-foreground">Carregando contas Meta Ads disponiveis...</p>
              ) : accounts && accounts.length > 0 ? (
                <>
                  <label className="flex flex-col gap-1">
                    <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conta de anuncio</span>
                    <select
                      value={selectedAccountId}
                      onChange={(event) => setSelectedAccountId(event.target.value)}
                      className="rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-medium text-foreground"
                    >
                      {accounts.map((account) => (
                        <option key={account.id} value={account.id}>{account.name}</option>
                      ))}
                    </select>
                  </label>
                  <div className="flex gap-2">
                    <Button type="button" variant="primary" size="sm" disabled={busy} onClick={() => void handleConfirmConnect()}>
                      {busy ? 'Vinculando...' : 'Vincular conta'}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setPickingAccount(false)} disabled={busy}>
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Nenhuma conta Meta Ads acessivel pelo servidor no momento.</p>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {integration.id === null ? (
              <Button type="button" variant="primary" size="sm" onClick={() => void handleStartConnect()} disabled={busy || pickingAccount}>
                Conectar
              </Button>
            ) : (
              <Button type="button" variant="secondary" size="sm" onClick={() => void handleSync()} disabled={busy}>
                {busy ? 'Sincronizando...' : 'Sincronizar agora'}
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

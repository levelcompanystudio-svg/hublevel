import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useAuth } from '../auth/useAuth';
import { ExternalClientCrmView } from './ExternalClientCrmView';
import { ExternalClientSelector } from './ExternalClientSelector';
import { listMyExternalClientLinks } from './external.api';
import type { ExternalClientLink } from './external.api';

// Portal externo minimo (profile_type='external', rota /cliente - ver ProtectedRoute
// requireProfileType="external" em routes/index.tsx). Le client_user_memberships (RLS: "external
// user can read own membership", migration 031) e, para cada client_id vinculado, os dados
// basicos do cliente em public.clients (RLS: "external user can read own linked clients",
// migration 033 - CRM Etapa 8) via listMyExternalClientLinks. A partir dai, os dados de CRM usam
// a mesma RLS interna (user_can_access_crm_client, migration 031), que ja cobria acesso externo
// desde a Etapa 7. Somente leitura: todo componente reaproveitado da aba CRM interna recebe
// canManage=false, que ja esconde criar/editar/mover/trocar status - nenhuma logica de escrita
// fica acessivel.
export function ExternalClientPortal() {
  const { profile, signOut, loading: authLoading } = useAuth();
  const [links, setLinks] = useState<ExternalClientLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      setLoading(true);
      setError(null);
      const result = await listMyExternalClientLinks(profile.id);
      setLinks(result);
      if (result.length === 1) setSelectedClientId(result[0].client.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar seus dados.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    void load();
  }, [load]);

  const selectedLink = selectedClientId ? links.find((link) => link.client.id === selectedClientId) ?? null : null;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/60">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-card p-1 shadow-soft">
              <img src="/branding/level-hub-favicon.png" alt="Level Hub" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-foreground">HubLevel</p>
              <p className="truncate text-xs text-muted-foreground">
                {selectedLink ? selectedLink.client.trade_name || selectedLink.client.company_name : 'Area do cliente'}
                {profile?.name ? ` - ${profile.name}` : ''}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {links.length > 1 && selectedClientId && (
              <button
                type="button"
                onClick={() => setSelectedClientId(null)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Trocar cliente
              </button>
            )}
            <button
              type="button"
              onClick={() => void signOut()}
              disabled={authLoading}
              className="rounded-md border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-foreground transition-colors duration-150 hover:bg-card-elevated disabled:cursor-not-allowed disabled:opacity-60"
            >
              {authLoading ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
        {loading ? (
          <LoadingState title="Carregando seus dados" />
        ) : error ? (
          <ErrorState description={error} />
        ) : links.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-1.5 text-center">
            <p className="text-sm font-semibold text-foreground">Nenhum cliente vinculado a sua conta ainda.</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Assim que uma equipe HubLevel vincular sua conta a um cliente, ele aparecera aqui.
            </p>
          </div>
        ) : links.length > 1 && !selectedLink ? (
          <div className="flex justify-center">
            <ExternalClientSelector links={links} onSelect={setSelectedClientId} />
          </div>
        ) : selectedLink ? (
          <ExternalClientCrmView client={selectedLink.client} />
        ) : null}
      </main>
    </div>
  );
}

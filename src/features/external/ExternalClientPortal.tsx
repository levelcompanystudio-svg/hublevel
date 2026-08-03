import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { useAuth } from '../auth/useAuth';
import { ExternalClientCrmView } from './ExternalClientCrmView';
import { ExternalClientSelector } from './ExternalClientSelector';
import { listMyActiveClientMemberships } from './external.api';
import type { ExternalClientMembership } from './external.api';

// Portal externo minimo (profile_type='external', rota /cliente - ver ProtectedRoute
// requireProfileType="external" em routes/index.tsx). Le somente client_user_memberships (RLS:
// "external user can read own membership", migration 031) e, a partir do client_id, os dados de
// CRM via crm.api.ts - a mesma RLS interna (user_can_access_crm_client) ja cobre acesso externo
// com membership ativa, entao nenhuma policy nova foi necessaria para o CRM funcionar aqui.
// Somente leitura: todo componente reaproveitado da aba CRM interna recebe canManage=false, que
// ja esconde criar/editar/mover/trocar status - nenhuma logica de escrita fica acessivel.
//
// Limitacao conhecida (fora de escopo desta etapa - instrucao explicita de nao alterar RLS): nao
// existe hoje nenhuma policy de SELECT em public.clients para profile_type='external', entao nao
// ha como buscar o nome real do cliente (razao social) sem uma nova policy. A UI mostra um rotulo
// generico "Cliente" + os 8 primeiros caracteres do client_id ate essa policy existir. Policy
// minima sugerida para uma proxima etapa dedicada a isso:
//   create policy "external user can read own linked clients"
//   on public.clients for select
//   to authenticated
//   using (public.is_external_user() and public.user_has_client_membership(id));
export function ExternalClientPortal() {
  const { profile, signOut, loading: authLoading } = useAuth();
  const [memberships, setMemberships] = useState<ExternalClientMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!profile) return;
    try {
      setLoading(true);
      setError(null);
      const result = await listMyActiveClientMemberships(profile.id);
      setMemberships(result);
      if (result.length === 1) setSelectedClientId(result[0].client_id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar seus dados.');
    } finally {
      setLoading(false);
    }
  }, [profile]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <p className="text-sm font-semibold text-foreground">HubLevel</p>
          <p className="text-xs text-muted-foreground">Area do cliente{profile?.name ? ` - ${profile.name}` : ''}</p>
        </div>
        <div className="flex items-center gap-3">
          {memberships.length > 1 && selectedClientId && (
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
      </header>

      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        {loading ? (
          <LoadingState title="Carregando seus dados" />
        ) : error ? (
          <ErrorState description={error} />
        ) : memberships.length === 0 ? (
          <div className="flex min-h-[320px] flex-col items-center justify-center gap-1.5 text-center">
            <p className="text-sm font-semibold text-foreground">Nenhum cliente vinculado a sua conta ainda.</p>
            <p className="max-w-sm text-xs text-muted-foreground">
              Assim que uma equipe HubLevel vincular sua conta a um cliente, ele aparecera aqui.
            </p>
          </div>
        ) : memberships.length > 1 && !selectedClientId ? (
          <div className="flex justify-center">
            <ExternalClientSelector memberships={memberships} onSelect={setSelectedClientId} />
          </div>
        ) : selectedClientId ? (
          <ExternalClientCrmView clientId={selectedClientId} />
        ) : null}
      </main>
    </div>
  );
}

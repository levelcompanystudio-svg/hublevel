import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listClients } from '../../clients/clients.api';
import type { Client } from '../../clients/clients.types';
import { LandingPageHeader } from '../components/LandingPageHeader';

export function PlannerOverviewPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // Reaproveita listClients() ja existente (mesma query da listagem de clientes).
        const result = await listClients();
        if (active) setClients(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar clientes.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canAccess]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-6">
      <LandingPageHeader
        title="Planejador de landing pages"
        description="Briefing de landing page por cliente, salvo no banco. Sem geracao por IA, sem publicacao e sem captura de leads ainda."
      />

      <Card>
        <h3 className="text-sm font-semibold text-foreground">Como usar hoje</h3>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Escolha um cliente abaixo e abra a aba "Landing Page" no detalhe dele para preencher e salvar o briefing.
          Os dados ficam salvos por cliente e podem ser editados a qualquer momento. Geracao com IA, criacao real da
          LP e publicacao chegam em uma etapa futura.
        </p>
      </Card>

      {loading && <LoadingState title="Carregando clientes" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <Card className="overflow-hidden p-0">
          <div className="divide-y divide-border">
            {clients.length === 0 ? (
              <p className="p-5 text-sm text-muted-foreground">Nenhum cliente cadastrado ainda.</p>
            ) : (
              clients.map((client) => (
                <div key={client.id} className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{client.company_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{client.segment ?? 'Sem segmento'}</p>
                  </div>
                  <Link to={`/app/clientes/${client.id}`}>
                    <Button type="button" variant="secondary">Abrir cliente</Button>
                  </Link>
                </div>
              ))
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

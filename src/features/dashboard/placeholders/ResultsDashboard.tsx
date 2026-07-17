import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { Card } from '../../../components/ui';
import { listClients } from '../../clients/clients.api';
import type { Client, ClientHealthStatus } from '../../clients/clients.types';
import { emptyClientPerformanceMetrics } from '../../performance/performance.types';
import { PerformanceMetricsGrid } from '../../performance/components/PerformanceMetricsGrid';
import { DashboardSection } from '../components/DashboardSection';

const HEALTH_GROUPS: Array<{ status: ClientHealthStatus; label: string; dotClassName: string }> = [
  { status: 'saudavel', label: 'Saudavel', dotClassName: 'bg-success' },
  { status: 'atencao', label: 'Atencao', dotClassName: 'bg-warning' },
  { status: 'critico', label: 'Critico', dotClassName: 'bg-destructive' },
];

function clientName(client: Client): string {
  return client.trade_name || client.company_name;
}

// Painel geral de resultados: metricas de clientes/carteira ja existentes no HubLevel (reais),
// mais o espaco reservado para Investimento/Leads/CPL/ROAS/NPS assim que uma integracao de anuncios
// existir de verdade (mesmo componente ja usado em Performance, sem duplicar logica nem inventar numero).
export function ResultsDashboard() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await listClients();
        if (active) setClients(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar dados de clientes.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState title="Carregando painel de resultados" />;
  if (error) return <ErrorState description={error} />;

  const activeClients = clients.filter((client) => client.status === 'ativo');

  return (
    <div className="space-y-6">
      <DashboardSection title="Conversao" description="Carteira ativa e resultados de aquisicao pagos.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Clientes ativos"
            value={activeClients.length}
            description={`${clients.length} no total`}
            tone="brand"
          />
          <div className="sm:col-span-1 xl:col-span-3">
            <PerformanceMetricsGrid metrics={emptyClientPerformanceMetrics} />
          </div>
        </div>
      </DashboardSection>

      <Card>
        <h3 className="text-sm font-semibold text-foreground">Evolucao no periodo</h3>
        <p className="mt-1 text-xs text-muted-foreground">Investimento e leads ao longo do tempo, por integracao.</p>
        <div className="mt-4 flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-surface/40 py-10 text-center">
          <p className="text-sm font-semibold text-foreground">Nenhuma integracao conectada</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Conecte Meta Ads ou Google Ads em{' '}
            <Link to="/app/integracoes" className="font-semibold text-primary hover:underline">
              Integracoes
            </Link>{' '}
            para ver a evolucao de investimento e leads aqui.
          </p>
        </div>
      </Card>

      <DashboardSection title="Saude dos clientes" description="Distribuicao da carteira por status de saude, calculada em tempo real.">
        <div className="grid gap-4 lg:grid-cols-3">
          {HEALTH_GROUPS.map((group) => {
            const groupClients = clients.filter((client) => client.health_status === group.status);
            return (
              <Card key={group.status} className="flex flex-col">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${group.dotClassName}`} aria-hidden="true" />
                    <p className="text-sm font-semibold text-foreground">{group.label}</p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-foreground">{groupClients.length}</span>
                </div>
                <div className="mt-3 max-h-52 space-y-1.5 overflow-y-auto pr-1">
                  {groupClients.length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum cliente nesta faixa.</p>
                  ) : (
                    groupClients.map((client) => (
                      <Link
                        key={client.id}
                        to={`/app/clientes/${client.id}`}
                        className="block truncate text-xs font-medium text-primary hover:underline"
                      >
                        {clientName(client)}
                      </Link>
                    ))
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </DashboardSection>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { KpiStrip } from '../../../components/layout/KpiStrip';
import { Badge, Card, SectionHeader } from '../../../components/ui';
import { getAdminDashboardMetrics } from '../dashboard.api';
import type { AdminDashboardMetrics } from '../dashboard.types';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function AdminDashboard() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await getAdminDashboardMetrics();
        if (active) setMetrics(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar indicadores administrativos.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState title="Carregando indicadores administrativos" />;
  if (error) return <ErrorState description={error} />;
  if (!metrics) return null;

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <SectionHeader title="Visao administrativa" caption="Indicadores globais de operacao, receita, clientes, tarefas e reunioes." />

        <div className="space-y-3">
          <p className="text-caption uppercase text-muted-foreground">Carteira</p>
          <KpiStrip
            items={[
              { label: 'Clientes ativos', value: metrics.activeClients, tone: 'brand', description: 'Status ativo na carteira' },
              { label: 'Clientes em atraso', value: metrics.overdueClients, tone: metrics.overdueClients > 0 ? 'warning' : 'neutral', description: 'Financeiro atrasado' },
              { label: 'Sem atualizacao', value: metrics.clientsWithoutRecentUpdate, tone: metrics.clientsWithoutRecentUpdate > 0 ? 'warning' : 'neutral', description: 'Ultimos 7 dias' },
              { label: 'Sem reuniao', value: metrics.clientsWithoutRecentMeeting, tone: metrics.clientsWithoutRecentMeeting > 0 ? 'warning' : 'neutral', description: 'Ultimos 30 dias' },
            ]}
          />
        </div>

        <div className="space-y-3">
          <p className="text-caption uppercase text-muted-foreground">Receita e operacao</p>
          <KpiStrip
            items={[
              { label: 'Receita prevista', value: formatCurrency(metrics.expectedRevenue), tone: 'brand', description: 'Previsto + atrasado' },
              { label: 'Receita recebida', value: formatCurrency(metrics.receivedRevenue), tone: 'success', description: 'Registros pagos' },
              { label: 'Tarefas vencidas', value: metrics.overdueTasks, tone: metrics.overdueTasks > 0 ? 'warning' : 'neutral', description: 'Prazo expirado' },
              { label: 'Reunioes da semana', value: metrics.meetingsThisWeek, tone: 'neutral', description: 'Agendadas' },
            ]}
          />
        </div>
      </section>

      <Card>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Resumo executivo</h3>
          <Badge tone="brand">Admin</Badge>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Indicadores calculados a partir de clientes, tarefas, reunioes e financeiro. Alertas criticos e tendencias
          historicas continuam previstos para etapas futuras.
        </p>
      </Card>
    </div>
  );
}

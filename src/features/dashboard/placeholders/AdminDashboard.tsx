import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge, Card } from '../../../components/ui';
import { getAdminDashboardMetrics } from '../dashboard.api';
import type { AdminDashboardMetrics } from '../dashboard.types';
import { DashboardSection } from '../components/DashboardSection';
import { MetricCard } from '../components/MetricCard';

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

  const cards = [
    { title: 'Clientes Ativos', value: metrics.activeClients, description: 'Clientes com status ativo na carteira.' },
    { title: 'Clientes Em Atraso', value: metrics.overdueClients, description: 'Clientes com ao menos um registro financeiro atrasado.' },
    { title: 'Clientes Sem Atualizacao', value: metrics.clientsWithoutRecentUpdate, description: 'Clientes ativos sem atualizacao nos ultimos 7 dias.' },
    { title: 'Clientes Sem Reuniao', value: metrics.clientsWithoutRecentMeeting, description: 'Clientes ativos sem reuniao nos ultimos 30 dias.' },
    { title: 'Receita Prevista', value: formatCurrency(metrics.expectedRevenue), description: 'Soma de registros financeiros previstos e atrasados.' },
    { title: 'Receita Recebida', value: formatCurrency(metrics.receivedRevenue), description: 'Soma de registros financeiros pagos.' },
    { title: 'Tarefas Vencidas', value: metrics.overdueTasks, description: 'Tarefas com prazo expirado e nao concluidas.' },
    { title: 'Reunioes Da Semana', value: metrics.meetingsThisWeek, description: 'Reunioes agendadas para a semana atual.' },
  ];

  return (
    <div className="space-y-6">
      <DashboardSection
        title="Visao administrativa"
        description="Indicadores globais de operacao, receita, clientes, tarefas e reunioes."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <MetricCard key={card.title} title={card.title} value={card.value} description={card.description} />
          ))}
        </div>
      </DashboardSection>

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

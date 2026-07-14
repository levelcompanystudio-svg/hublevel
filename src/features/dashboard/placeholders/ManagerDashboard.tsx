import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge, Card } from '../../../components/ui';
import { getManagerDashboardMetrics } from '../dashboard.api';
import type { ManagerDashboardMetrics } from '../dashboard.types';
import { DashboardSection } from '../components/DashboardSection';
import { MetricCard } from '../components/MetricCard';

export function ManagerDashboard() {
  const [metrics, setMetrics] = useState<ManagerDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await getManagerDashboardMetrics();
        if (active) setMetrics(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar indicadores da carteira.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState title="Carregando indicadores da carteira" />;
  if (error) return <ErrorState description={error} />;
  if (!metrics) return null;

  const cards = [
    { title: 'Meus Clientes', value: metrics.myClients, description: 'Clientes sob sua responsabilidade.' },
    { title: 'Clientes Sem Atualizacao', value: metrics.clientsWithoutRecentUpdate, description: 'Clientes ativos sem atualizacao nos ultimos 7 dias.' },
    { title: 'Clientes Sem Reuniao', value: metrics.clientsWithoutRecentMeeting, description: 'Clientes ativos sem reuniao nos ultimos 30 dias.' },
    { title: 'Tarefas Vencidas', value: metrics.overdueTasks, description: 'Tarefas com prazo expirado e nao concluidas.' },
    { title: 'Reunioes Da Semana', value: metrics.meetingsThisWeek, description: 'Reunioes agendadas para a semana atual.' },
  ];

  return (
    <div className="space-y-6">
      <DashboardSection
        title="Minha carteira"
        description="Acompanhamento operacional dos clientes e atividades sob responsabilidade do gestor."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <MetricCard key={card.title} title={card.title} value={card.value} description={card.description} />
          ))}
        </div>
      </DashboardSection>

      <Card>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Foco operacional</h3>
          <Badge tone="brand">Gestor</Badge>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Indicadores calculados apenas com clientes, tarefas e reunioes visiveis para o seu papel. Financeiro nao e
          exibido para Gestor.
        </p>
      </Card>
    </div>
  );
}

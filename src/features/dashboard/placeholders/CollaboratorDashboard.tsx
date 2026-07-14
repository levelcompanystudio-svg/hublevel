import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge, Card } from '../../../components/ui';
import { getCollaboratorDashboardMetrics } from '../dashboard.api';
import type { CollaboratorDashboardMetrics } from '../dashboard.types';
import { DashboardSection } from '../components/DashboardSection';
import { MetricCard } from '../components/MetricCard';

export function CollaboratorDashboard() {
  const [metrics, setMetrics] = useState<CollaboratorDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await getCollaboratorDashboardMetrics();
        if (active) setMetrics(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar indicadores pessoais.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  if (loading) return <LoadingState title="Carregando sua rotina" />;
  if (error) return <ErrorState description={error} />;
  if (!metrics) return null;

  const cards = [
    { title: 'Minhas Tarefas', value: metrics.myTasks, description: 'Total de tarefas atribuidas a voce.' },
    { title: 'Tarefas Vencidas', value: metrics.overdueTasks, description: 'Suas tarefas com prazo expirado e nao concluidas.' },
    { title: 'Minhas Reunioes', value: metrics.myMeetingsThisWeek, description: 'Reunioes desta semana em que voce e participante.' },
  ];

  return (
    <div className="space-y-6">
      <DashboardSection
        title="Minha rotina"
        description="Resumo individual de tarefas e reunioes atribuidas ao colaborador."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((card) => (
            <MetricCard key={card.title} title={card.title} value={card.value} description={card.description} />
          ))}
        </div>
      </DashboardSection>

      <Card>
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-foreground">Prioridades pessoais</h3>
          <Badge tone="brand">Colaborador</Badge>
        </div>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Indicadores individuais, sem acesso a financeiro, contratos ou carteira global de clientes.
        </p>
      </Card>
    </div>
  );
}

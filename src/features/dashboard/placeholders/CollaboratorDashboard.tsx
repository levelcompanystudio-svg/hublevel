import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge, Card, SectionHeader } from '../../../components/ui';
import { getCollaboratorDashboardMetrics } from '../dashboard.api';
import type { CollaboratorDashboardMetrics } from '../dashboard.types';
import { DashboardKpiStrip } from '../components/DashboardKpiStrip';

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

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <SectionHeader title="Minha rotina" caption="Resumo individual de tarefas e reunioes atribuidas ao colaborador." />
        <DashboardKpiStrip
          items={[
            { label: 'Minhas tarefas', value: metrics.myTasks, description: 'Total atribuidas a voce', tone: 'brand' },
            {
              label: 'Tarefas vencidas',
              value: metrics.overdueTasks,
              description: 'Prazo expirado e nao concluidas',
              tone: metrics.overdueTasks > 0 ? 'warning' : 'neutral',
            },
            { label: 'Minhas reunioes', value: metrics.myMeetingsThisWeek, description: 'Nesta semana', tone: 'neutral' },
          ]}
        />
      </section>

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

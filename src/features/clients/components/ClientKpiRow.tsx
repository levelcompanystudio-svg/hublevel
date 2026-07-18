import { StatsGrid } from '../../../components/layout/StatsGrid';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import type { ClientOverviewMetrics } from '../client-overview.types';

interface ClientKpiRowProps {
  metrics: ClientOverviewMetrics;
}

function formatDate(value: string | null) {
  if (!value) return 'Sem registro';
  return new Date(value).toLocaleDateString('pt-BR');
}

function formatDateTime(value: string | null) {
  if (!value) return 'Sem agendamento';
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function ClientKpiRow({ metrics }: ClientKpiRowProps) {
  return (
    <StatsGrid className="gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <SummaryCard label="Servicos ativos" value={metrics.activeServices} tone="brand" density="compact" />
      <SummaryCard
        label="Tarefas abertas"
        value={metrics.openTasks}
        description={metrics.overdueTasks > 0 ? `${metrics.overdueTasks} vencidas` : 'Nenhuma vencida'}
        tone={metrics.overdueTasks > 0 ? 'warning' : 'success'}
        density="compact"
      />
      <SummaryCard
        label="Ultima atualizacao"
        value={formatDate(metrics.lastUpdate?.update_date ?? null)}
        tone={metrics.lastUpdate ? 'success' : 'warning'}
        density="compact"
      />
      <SummaryCard
        label="Proxima reuniao"
        value={formatDateTime(metrics.nextMeeting?.scheduled_at ?? null)}
        tone={metrics.nextMeeting ? 'success' : 'warning'}
        density="compact"
      />
      <SummaryCard
        label="Checklist"
        value={`${metrics.checklistDone}/${metrics.checklistTotal}`}
        description="Tarefas concluidas do total"
        density="compact"
      />
      <SummaryCard label="Documentos recentes" value={metrics.recentDocuments.length} density="compact" />
    </StatsGrid>
  );
}

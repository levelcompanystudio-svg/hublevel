import type { ClientOverviewMetrics } from '../client-overview.types';
import { ClientKpiStrip } from './ClientKpiStrip';

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
    <ClientKpiStrip
      density="compact"
      items={[
        { label: 'Servicos ativos', value: metrics.activeServices, tone: 'brand' },
        {
          label: 'Tarefas abertas',
          value: metrics.openTasks,
          description: metrics.overdueTasks > 0 ? `${metrics.overdueTasks} vencidas` : 'Nenhuma vencida',
          tone: metrics.overdueTasks > 0 ? 'warning' : 'success',
        },
        {
          label: 'Ultima atualizacao',
          value: formatDate(metrics.lastUpdate?.update_date ?? null),
          tone: metrics.lastUpdate ? 'success' : 'warning',
        },
        {
          label: 'Proxima reuniao',
          value: formatDateTime(metrics.nextMeeting?.scheduled_at ?? null),
          tone: metrics.nextMeeting ? 'success' : 'warning',
        },
        {
          label: 'Checklist',
          value: `${metrics.checklistDone}/${metrics.checklistTotal}`,
          description: 'Concluidas do total',
        },
        { label: 'Documentos recentes', value: metrics.recentDocuments.length },
      ]}
    />
  );
}

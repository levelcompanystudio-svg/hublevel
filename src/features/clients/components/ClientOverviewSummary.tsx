import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui';
import type { ClientOverviewData, ClientOverviewMetrics } from '../client-overview.types';

interface ClientOverviewSummaryProps {
  data: ClientOverviewData;
  metrics: ClientOverviewMetrics;
}

function formatDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function ClientOverviewSummary({ data, metrics }: ClientOverviewSummaryProps) {
  const risks: string[] = [];
  if (metrics.overdueTasks > 0) risks.push(`${metrics.overdueTasks} tarefa(s) vencida(s).`);
  if (!metrics.lastUpdate) risks.push('Nenhuma atualizacao registrada ainda.');
  if (!metrics.nextMeeting) risks.push('Nenhuma reuniao agendada para os proximos dias.');

  const upcomingTasks = data.tasks
    .filter((task) => task.status !== 'concluida' && task.status !== 'cancelada' && task.due_date !== null)
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))
    .slice(0, 4);

  const activeServiceNames = data.services
    .filter((service) => service.status === 'ativo')
    .map((service) => {
      const serviceRef = Array.isArray(service.service) ? service.service[0] : service.service;
      return serviceRef?.name ?? 'Servico';
    });

  return (
    <div className="space-y-4">
      <Card className={risks.length > 0 ? 'border-warning/40' : 'border-success/40'}>
        <h3 className="text-sm font-semibold text-foreground">Sinais de risco</h3>
        {risks.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {risks.map((risk) => (
              <li key={risk} className="flex items-start gap-2 text-sm text-warning">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning" aria-hidden="true" />
                {risk}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm text-success">Nenhum risco identificado com os dados atuais.</p>
        )}
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h3 className="text-sm font-semibold text-foreground">Atividade recente</h3>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ultima atualizacao</p>
              {metrics.lastUpdate ? (
                <>
                  <p className="mt-1 font-medium text-foreground">{metrics.lastUpdate.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(metrics.lastUpdate.update_date)}</p>
                </>
              ) : (
                <p className="mt-1 text-muted-foreground">Nenhuma atualizacao registrada.</p>
              )}
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Documentos recentes</p>
              {metrics.recentDocuments.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {metrics.recentDocuments.map((document) => (
                    <li key={document.id}>
                      <Link to={`/app/documentos/${document.id}`} className="text-primary hover:underline">
                        {document.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-muted-foreground">Nenhum documento cadastrado.</p>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-foreground">Proximos passos</h3>
          <div className="mt-3 space-y-3 text-sm">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Proxima reuniao</p>
              {metrics.nextMeeting ? (
                <>
                  <p className="mt-1 font-medium text-foreground">{metrics.nextMeeting.title}</p>
                  <p className="text-xs text-muted-foreground">{formatDateTime(metrics.nextMeeting.scheduled_at)}</p>
                </>
              ) : (
                <p className="mt-1 text-muted-foreground">Nenhuma reuniao agendada.</p>
              )}
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tarefas com prazo proximo</p>
              {upcomingTasks.length > 0 ? (
                <ul className="mt-1 space-y-1">
                  {upcomingTasks.map((task) => (
                    <li key={task.id} className="flex items-center justify-between gap-2">
                      <Link to={`/app/tarefas/${task.id}`} className="truncate text-primary hover:underline">
                        {task.title}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground">{task.due_date ? formatDate(task.due_date) : '-'}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1 text-muted-foreground">Nenhuma tarefa aberta com prazo definido.</p>
              )}
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="text-sm font-semibold text-foreground">Servicos ativos</h3>
        {activeServiceNames.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {activeServiceNames.map((name, index) => (
              <span
                key={`${name}-${index}`}
                className="rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-semibold text-muted-foreground"
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-muted-foreground">Nenhum servico ativo vinculado a este cliente.</p>
        )}
      </Card>
    </div>
  );
}

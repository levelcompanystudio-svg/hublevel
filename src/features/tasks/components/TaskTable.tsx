import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Task, TaskStatus } from '../tasks.types';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskStatusBadge } from './TaskStatusBadge';

const CLOSED_STATUSES: TaskStatus[] = ['concluida', 'cancelada'];

interface TaskTableProps {
  tasks: Task[];
  canEdit: boolean;
  hasAnyTasks?: boolean;
  filtersActive?: boolean;
  busyTaskId?: string | null;
  onMarkCompleted?: (taskId: string) => void;
  onClearFilters?: () => void;
}

export function TaskTable({
  tasks,
  canEdit,
  hasAnyTasks = tasks.length > 0,
  filtersActive = false,
  busyTaskId = null,
  onMarkCompleted,
  onClearFilters,
}: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        {!hasAnyTasks ? (
          <EmptyState title="Nenhuma tarefa encontrada" description="As tarefas disponiveis para o seu papel aparecerao aqui." />
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <EmptyState title="Nenhuma tarefa corresponde aos filtros" description="Ajuste os filtros selecionados para ver outras tarefas." />
            {filtersActive && (
              <Button type="button" variant="secondary" size="sm" onClick={onClearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3.5 font-semibold">Tarefa</th>
              <th className="px-4 py-3.5 font-semibold">Cliente</th>
              <th className="px-4 py-3.5 font-semibold">Responsavel</th>
              <th className="px-4 py-3.5 font-semibold">Prioridade</th>
              <th className="px-4 py-3.5 font-semibold">Status</th>
              <th className="px-4 py-3.5 font-semibold">Prazo</th>
              <th className="px-4 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map((task) => {
              const isOpenTask = !CLOSED_STATUSES.includes(task.status);
              const busy = busyTaskId === task.id;

              return (
                <tr key={task.id} className="bg-card transition-colors hover:bg-card-elevated">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{task.category || 'Sem categoria'}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {task.client_id ? (
                      <Link to={`/app/clientes/${task.client_id}`} className="text-primary hover:underline">
                        {clientName(task)}
                      </Link>
                    ) : (
                      clientName(task)
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{profileName(task.assignee)}</td>
                  <td className="px-4 py-3"><TaskPriorityBadge priority={task.priority} /></td>
                  <td className="px-4 py-3"><TaskStatusBadge status={task.status} /></td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(task.due_date)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Link to={`/app/tarefas/${task.id}`}>
                        <Button type="button" variant="ghost" size="sm">Ver</Button>
                      </Link>
                      {canEdit && (
                        <Link to={`/app/tarefas/${task.id}/editar`}>
                          <Button type="button" variant="ghost" size="sm">Editar</Button>
                        </Link>
                      )}
                      {isOpenTask && onMarkCompleted && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={busy}
                          onClick={() => onMarkCompleted(task.id)}
                        >
                          {busy ? 'Salvando...' : 'Concluir'}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function clientName(task: Task): string {
  const client = Array.isArray(task.client) ? task.client[0] : task.client;
  return client?.trade_name || client?.company_name || '-';
}

export function profileName(profile: Task['assignee'] | Task['creator']): string {
  const value = Array.isArray(profile) ? profile[0] : profile;
  return value?.name || '-';
}

export function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}

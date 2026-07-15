import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Task } from '../tasks.types';
import { TaskPriorityBadge } from './TaskPriorityBadge';
import { TaskStatusBadge } from './TaskStatusBadge';

interface TaskTableProps {
  tasks: Task[];
  canEdit: boolean;
}

export function TaskTable({ tasks, canEdit }: TaskTableProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <EmptyState title="Nenhuma tarefa encontrada" description="As tarefas disponiveis para o seu papel aparecerao aqui." />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Tarefa</th>
              <th className="px-5 py-3.5 font-semibold">Cliente</th>
              <th className="px-5 py-3.5 font-semibold">Responsavel</th>
              <th className="px-5 py-3.5 font-semibold">Prioridade</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Prazo</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.map((task) => (
              <tr key={task.id} className="bg-card transition-colors hover:bg-card-elevated">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{task.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{task.category || 'Sem categoria'}</p>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{clientName(task)}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{profileName(task.assignee)}</td>
                <td className="px-5 py-4"><TaskPriorityBadge priority={task.priority} /></td>
                <td className="px-5 py-4"><TaskStatusBadge status={task.status} /></td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(task.due_date)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/app/tarefas/${task.id}`}><Button type="button" variant="ghost">Ver</Button></Link>
                    {canEdit && <Link to={`/app/tarefas/${task.id}/editar`}><Button type="button">Editar</Button></Link>}
                  </div>
                </td>
              </tr>
            ))}
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

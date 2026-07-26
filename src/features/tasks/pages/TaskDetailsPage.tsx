import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { getTask, updateTaskStatus } from '../tasks.api';
import type { Task, TaskStatus } from '../tasks.types';
import { TaskPriorityBadge } from '../components/TaskPriorityBadge';
import { TaskStatusBadge } from '../components/TaskStatusBadge';
import { TaskStatusUpdateForm } from '../components/TaskStatusUpdateForm';
import { clientName, formatDate, profileName } from '../components/TaskTable';
import { TaskHeader } from '../components/TaskHeader';

const CLOSED_STATUSES: TaskStatus[] = ['concluida', 'cancelada'];

export function TaskDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [statusValue, setStatusValue] = useState<TaskStatus>('a_fazer');
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [quickCompleting, setQuickCompleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const role = profile?.roles?.name;
  const canEditGeneral = role === 'admin' || role === 'gestor';
  const canUpdateStatusOnly = role === 'colaborador';

  async function loadTask(taskId: string, active = true) {
    try {
      setLoading(true);
      setError(null);
      const result = await getTask(taskId);
      if (!active) return;
      setTask(result);
      setStatusValue(result.status);
    } catch (err: unknown) {
      if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar tarefa.');
    } finally {
      if (active) setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    void loadTask(id, active);
    return () => {
      active = false;
    };
  }, [id]);

  async function handleStatusSubmit() {
    if (!id) return;
    try {
      setSavingStatus(true);
      setError(null);
      const updated = await updateTaskStatus(id, statusValue);
      setTask(updated);
      setStatusValue(updated.status);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status da tarefa.');
    } finally {
      setSavingStatus(false);
    }
  }

  async function handleQuickComplete() {
    if (!id) return;
    try {
      setQuickCompleting(true);
      setError(null);
      const updated = await updateTaskStatus(id, 'concluida');
      setTask(updated);
      setStatusValue(updated.status);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao concluir tarefa.');
    } finally {
      setQuickCompleting(false);
    }
  }

  const isOpenTask = task ? !CLOSED_STATUSES.includes(task.status) : false;

  return (
    <div className="space-y-5">
      <TaskHeader title={task?.title ?? 'Tarefa'} description="Detalhe operacional da tarefa." />
      {loading && <LoadingState title="Carregando tarefa" />}
      {error && <ErrorState description={error} />}
      {!loading && task && (
        <>
          <Card>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  <TaskStatusBadge status={task.status} />
                  <TaskPriorityBadge priority={task.priority} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{task.description || 'Sem descricao cadastrada.'}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                {task.client_id && (
                  <Link to={`/app/clientes/${task.client_id}`}>
                    <Button type="button" variant="ghost" size="sm">Abrir cliente</Button>
                  </Link>
                )}
                {isOpenTask && (
                  <Button type="button" variant="secondary" size="sm" disabled={quickCompleting} onClick={() => void handleQuickComplete()}>
                    {quickCompleting ? 'Concluindo...' : 'Marcar concluida'}
                  </Button>
                )}
                {canEditGeneral && (
                  <Link to={`/app/tarefas/${task.id}/editar`}>
                    <Button type="button" size="sm">Editar tarefa</Button>
                  </Link>
                )}
              </div>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Cliente" value={clientName(task)} to={task.client_id ? `/app/clientes/${task.client_id}` : undefined} />
              <InfoItem label="Responsavel" value={profileName(task.assignee)} />
              <InfoItem label="Criado por" value={profileName(task.creator)} />
              <InfoItem label="Prazo" value={formatDate(task.due_date)} />
              <InfoItem label="Categoria" value={task.category ?? '-'} />
              <InfoItem label="Concluida em" value={task.completed_at ? new Intl.DateTimeFormat('pt-BR').format(new Date(task.completed_at)) : '-'} />
            </div>
            <div className="mt-5 rounded-lg border border-border bg-muted/40 p-3.5">
              <p className="text-caption uppercase">Observacoes</p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted-foreground">{task.notes || 'Nenhuma observacao cadastrada.'}</p>
            </div>
          </Card>
          {canUpdateStatusOnly && (
            <TaskStatusUpdateForm status={statusValue} loading={savingStatus} onChange={setStatusValue} onSubmit={handleStatusSubmit} />
          )}
        </>
      )}
    </div>
  );
}

function InfoItem({ label, value, to }: { label: string; value: string; to?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-caption uppercase">{label}</p>
      {to ? (
        <Link to={to} className="mt-1 block truncate text-sm font-semibold text-primary hover:underline">
          {value}
        </Link>
      ) : (
        <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
      )}
    </div>
  );
}

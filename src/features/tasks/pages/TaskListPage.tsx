import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { PageHeader } from '../../../components/layout/PageHeader';
import { StatsGrid } from '../../../components/layout/StatsGrid';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { Button } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { listTasks, updateTaskStatus } from '../tasks.api';
import type { Task, TaskPriority, TaskStatus } from '../tasks.types';
import { taskPriorityLabels } from '../components/TaskPriorityBadge';
import { taskStatusLabels } from '../components/TaskStatusBadge';
import { TaskTable } from '../components/TaskTable';

const CLOSED_STATUSES: TaskStatus[] = ['concluida', 'cancelada'];
const FILTER_ALL = 'todos';
type QuickFilter = 'todos' | 'vencidas' | 'minhas';

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function isOverdue(task: Task): boolean {
  return Boolean(task.due_date) && task.due_date! < todayDateOnly() && !CLOSED_STATUSES.includes(task.status);
}

interface FilterSelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}

function FilterSelect<T extends string>({ label, value, onChange, options }: FilterSelectProps<T>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export function TaskListPage() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const role = profile?.roles?.name;
  const canCreate = role === 'admin' || role === 'gestor';

  const [quickFilter, setQuickFilter] = useState<QuickFilter>('todos');
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'todos'>(FILTER_ALL);
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | 'todos'>(FILTER_ALL);
  const [assigneeFilter, setAssigneeFilter] = useState<string>(FILTER_ALL);
  const [clientFilter, setClientFilter] = useState<string>(FILTER_ALL);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const result = await listTasks();
      setTasks(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function handleMarkCompleted(taskId: string) {
    try {
      setBusyTaskId(taskId);
      await updateTaskStatus(taskId, 'concluida');
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao concluir tarefa.');
    } finally {
      setBusyTaskId(null);
    }
  }

  function handleClearFilters() {
    setQuickFilter('todos');
    setStatusFilter(FILTER_ALL);
    setPriorityFilter(FILTER_ALL);
    setAssigneeFilter(FILTER_ALL);
    setClientFilter(FILTER_ALL);
  }

  const assigneeOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const task of tasks) {
      const assignee = Array.isArray(task.assignee) ? task.assignee[0] : task.assignee;
      if (assignee) map.set(assignee.id, assignee.name);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tasks]);

  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const task of tasks) {
      const client = Array.isArray(task.client) ? task.client[0] : task.client;
      if (task.client_id && client) map.set(task.client_id, client.trade_name || client.company_name);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [tasks]);

  const filtersActive =
    quickFilter !== 'todos' ||
    statusFilter !== FILTER_ALL ||
    priorityFilter !== FILTER_ALL ||
    assigneeFilter !== FILTER_ALL ||
    clientFilter !== FILTER_ALL;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesQuick =
        quickFilter === 'todos' ||
        (quickFilter === 'vencidas' && isOverdue(task)) ||
        (quickFilter === 'minhas' && task.assigned_to_user_id === profile?.id);

      if (!matchesQuick) return false;
      if (statusFilter !== FILTER_ALL && task.status !== statusFilter) return false;
      if (priorityFilter !== FILTER_ALL && task.priority !== priorityFilter) return false;
      if (assigneeFilter !== FILTER_ALL && task.assigned_to_user_id !== assigneeFilter) return false;
      if (clientFilter !== FILTER_ALL && task.client_id !== clientFilter) return false;
      return true;
    });
  }, [tasks, quickFilter, statusFilter, priorityFilter, assigneeFilter, clientFilter, profile?.id]);

  const pendingTasks = tasks.filter((task) => task.status === 'a_fazer').length;
  const activeTasks = tasks.filter((task) => task.status === 'em_andamento').length;
  const overdueTasks = tasks.filter((task) => isOverdue(task)).length;
  const urgentTasks = tasks.filter((task) => task.priority === 'urgente' && !CLOSED_STATUSES.includes(task.status)).length;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operacao"
        title="Tarefas"
        description="Central operacional de tarefas: prioridades, prazos e responsaveis da equipe."
        action={canCreate ? (
          <Link to="/app/tarefas/novo">
            <Button type="button" variant="primary">Nova tarefa</Button>
          </Link>
        ) : undefined}
      />
      {loading && <LoadingState title="Carregando tarefas" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <StatsGrid className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <SummaryCard label="Total de tarefas" value={tasks.length} tone="brand" />
            <SummaryCard label="Pendentes" value={pendingTasks} tone="neutral" />
            <SummaryCard label="Em andamento" value={activeTasks} tone="neutral" />
            <SummaryCard label="Vencidas" value={overdueTasks} tone={overdueTasks > 0 ? 'warning' : 'neutral'} />
            <SummaryCard label="Urgentes" value={urgentTasks} tone={urgentTasks > 0 ? 'warning' : 'neutral'} />
          </StatsGrid>

          <FilterBar label="Visao rapida">
            <div className="flex flex-wrap gap-1.5">
              {([
                { value: 'todos', label: 'Todas' },
                { value: 'vencidas', label: 'Vencidas' },
                { value: 'minhas', label: 'Minhas tarefas' },
              ] as Array<{ value: QuickFilter; label: string }>).map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setQuickFilter(filter.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    quickFilter === filter.value
                      ? 'border-primary/60 bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </FilterBar>

          <FilterBar label="Filtros">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: FILTER_ALL, label: 'Todos' },
                  ...(Object.keys(taskStatusLabels) as TaskStatus[]).map((option) => ({ value: option, label: taskStatusLabels[option] })),
                ]}
              />
              <FilterSelect
                label="Prioridade"
                value={priorityFilter}
                onChange={setPriorityFilter}
                options={[
                  { value: FILTER_ALL, label: 'Todas' },
                  ...(Object.keys(taskPriorityLabels) as TaskPriority[]).map((option) => ({ value: option, label: taskPriorityLabels[option] })),
                ]}
              />
              <FilterSelect
                label="Responsavel"
                value={assigneeFilter}
                onChange={setAssigneeFilter}
                options={[{ value: FILTER_ALL, label: 'Todos' }, ...assigneeOptions]}
              />
              <FilterSelect
                label="Cliente"
                value={clientFilter}
                onChange={setClientFilter}
                options={[{ value: FILTER_ALL, label: 'Todos' }, ...clientOptions]}
              />
            </div>
            {filtersActive && (
              <Button type="button" variant="ghost" size="sm" onClick={handleClearFilters} className="shrink-0">
                Limpar filtros
              </Button>
            )}
          </FilterBar>

          <TaskTable
            tasks={filteredTasks}
            canEdit={canCreate}
            hasAnyTasks={tasks.length > 0}
            filtersActive={filtersActive}
            busyTaskId={busyTaskId}
            onMarkCompleted={(taskId) => void handleMarkCompleted(taskId)}
            onClearFilters={handleClearFilters}
          />
        </>
      )}
    </div>
  );
}

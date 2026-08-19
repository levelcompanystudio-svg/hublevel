import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterPanel } from '../../../components/layout/FilterPanel';
import { KpiStrip } from '../../../components/layout/KpiStrip';
import { PageHeader } from '../../../components/layout/PageHeader';
import { QuickFilterPill } from '../../../components/layout/QuickFilterPill';
import { Button, SectionHeader } from '../../../components/ui';
import { useTopbarAction } from '../../app/layout/TopbarContext';
import { useAuth } from '../../auth/useAuth';
import { listTasks, updateTaskStatus } from '../tasks.api';
import type { Task, TaskPriority, TaskStatus } from '../tasks.types';
import { taskPriorityLabels } from '../components/TaskPriorityBadge';
import { taskStatusLabels } from '../components/TaskStatusBadge';
import { TaskTable } from '../components/TaskTable';

const CLOSED_STATUSES: TaskStatus[] = ['concluida', 'cancelada'];
const FILTER_ALL = 'todos';

type QuickFilter = 'todos' | 'vencidas' | 'hoje' | 'proximos7' | 'sem_prazo' | 'urgentes' | 'minhas';
type UrgencyBucket = 'vencidas' | 'hoje' | 'proximos7' | 'sem_prazo' | 'outras';

const BUCKET_ORDER: Array<{ key: UrgencyBucket; title: string }> = [
  { key: 'vencidas', title: 'Vencidas' },
  { key: 'hoje', title: 'Hoje' },
  { key: 'proximos7', title: 'Proximos 7 dias' },
  { key: 'sem_prazo', title: 'Sem prazo' },
  { key: 'outras', title: 'Outras' },
];

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysFromNowDateOnly(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function isOpen(task: Task): boolean {
  return !CLOSED_STATUSES.includes(task.status);
}

function isOverdue(task: Task, today: string): boolean {
  return isOpen(task) && Boolean(task.due_date) && task.due_date! < today;
}

function isDueToday(task: Task, today: string): boolean {
  return isOpen(task) && task.due_date === today;
}

function isDueNext7Days(task: Task, today: string, in7Days: string): boolean {
  return isOpen(task) && Boolean(task.due_date) && task.due_date! > today && task.due_date! <= in7Days;
}

function hasNoDueDate(task: Task): boolean {
  return isOpen(task) && !task.due_date;
}

function isUrgent(task: Task): boolean {
  return isOpen(task) && task.priority === 'urgente';
}

function isMine(task: Task, userId: string | undefined): boolean {
  return isOpen(task) && Boolean(userId) && task.assigned_to_user_id === userId;
}

function getUrgencyBucket(task: Task, today: string, in7Days: string): UrgencyBucket {
  if (isOverdue(task, today)) return 'vencidas';
  if (isDueToday(task, today)) return 'hoje';
  if (isDueNext7Days(task, today, in7Days)) return 'proximos7';
  if (hasNoDueDate(task)) return 'sem_prazo';
  return 'outras';
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

// Central de execucao de tarefas (/app/tarefas). Uma unica chamada a listTasks() (RLS ja escopa
// admin/gestor/colaborador) alimenta cards de resumo, pilulas de filtro rapido, filtros
// detalhados e o agrupamento por urgencia - nenhuma query nova e disparada por filtro/bucket,
// tudo e derivado em memoria do mesmo array de tarefas ja carregado.
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
  const [categoryFilter, setCategoryFilter] = useState<string>(FILTER_ALL);

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
    setCategoryFilter(FILTER_ALL);
  }

  const today = todayDateOnly();
  const in7Days = daysFromNowDateOnly(7);

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

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const task of tasks) {
      if (task.category) set.add(task.category);
    }
    return Array.from(set)
      .sort((a, b) => a.localeCompare(b))
      .map((category) => ({ value: category, label: category }));
  }, [tasks]);

  const filtersActive =
    quickFilter !== 'todos' ||
    statusFilter !== FILTER_ALL ||
    priorityFilter !== FILTER_ALL ||
    assigneeFilter !== FILTER_ALL ||
    clientFilter !== FILTER_ALL ||
    categoryFilter !== FILTER_ALL;

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesQuick =
        quickFilter === 'todos'
          ? statusFilter === FILTER_ALL ? isOpen(task) : true
          : quickFilter === 'vencidas' ? isOverdue(task, today)
          : quickFilter === 'hoje' ? isDueToday(task, today)
          : quickFilter === 'proximos7' ? isDueNext7Days(task, today, in7Days)
          : quickFilter === 'sem_prazo' ? hasNoDueDate(task)
          : quickFilter === 'urgentes' ? isUrgent(task)
          : isMine(task, profile?.id);

      if (!matchesQuick) return false;
      if (statusFilter !== FILTER_ALL && task.status !== statusFilter) return false;
      if (priorityFilter !== FILTER_ALL && task.priority !== priorityFilter) return false;
      if (assigneeFilter !== FILTER_ALL && task.assigned_to_user_id !== assigneeFilter) return false;
      if (clientFilter !== FILTER_ALL && task.client_id !== clientFilter) return false;
      if (categoryFilter !== FILTER_ALL && task.category !== categoryFilter) return false;
      return true;
    });
  }, [tasks, quickFilter, statusFilter, priorityFilter, assigneeFilter, clientFilter, categoryFilter, profile?.id, today, in7Days]);

  const bucketedTasks = useMemo(() => {
    const buckets: Record<UrgencyBucket, Task[]> = { vencidas: [], hoje: [], proximos7: [], sem_prazo: [], outras: [] };
    for (const task of filteredTasks) {
      buckets[getUrgencyBucket(task, today, in7Days)].push(task);
    }
    return buckets;
  }, [filteredTasks, today, in7Days]);

  const totalAbertas = tasks.filter(isOpen).length;
  const vencidasCount = tasks.filter((task) => isOverdue(task, today)).length;
  const hojeCount = tasks.filter((task) => isDueToday(task, today)).length;
  const proximos7Count = tasks.filter((task) => isDueNext7Days(task, today, in7Days)).length;
  const urgentesCount = tasks.filter(isUrgent).length;
  const minhasCount = tasks.filter((task) => isMine(task, profile?.id)).length;

  useTopbarAction(
    canCreate ? (
      <Link to="/app/tarefas/novo">
        <Button type="button" variant="primary" size="sm">Nova tarefa</Button>
      </Link>
    ) : null,
    [canCreate],
  );

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operacao"
        title="Tarefas"
        description="Central de execucao: o que esta vencido, o que e para hoje e o que vem nos proximos dias, por cliente e responsavel."
      />
      {loading && <LoadingState title="Carregando tarefas" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <KpiStrip
            items={[
              { label: 'Total abertas', value: totalAbertas, tone: 'brand' },
              { label: 'Vencidas', value: vencidasCount, tone: vencidasCount > 0 ? 'destructive' : 'neutral' },
              { label: 'Hoje', value: hojeCount, tone: hojeCount > 0 ? 'warning' : 'neutral' },
              { label: 'Proximos 7 dias', value: proximos7Count, tone: 'neutral' },
              { label: 'Urgentes', value: urgentesCount, tone: urgentesCount > 0 ? 'warning' : 'neutral' },
              { label: 'Minhas tarefas', value: minhasCount, tone: 'neutral' },
            ]}
          />

          <FilterPanel
            filtersActive={filtersActive}
            onClearFilters={handleClearFilters}
            quickFilters={([
              { value: 'todos', label: 'Todas abertas' },
              { value: 'hoje', label: `Hoje${hojeCount > 0 ? ` (${hojeCount})` : ''}` },
              { value: 'vencidas', label: `Vencidas${vencidasCount > 0 ? ` (${vencidasCount})` : ''}` },
              { value: 'proximos7', label: 'Proximos 7 dias' },
              { value: 'minhas', label: 'Minhas' },
              { value: 'urgentes', label: 'Urgentes' },
              { value: 'sem_prazo', label: 'Sem prazo' },
            ] as Array<{ value: QuickFilter; label: string }>).map((filter) => (
              <QuickFilterPill
                key={filter.value}
                label={filter.label}
                active={quickFilter === filter.value}
                onClick={() => setQuickFilter(filter.value)}
              />
            ))}
          >
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
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
              <FilterSelect
                label="Categoria"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[{ value: FILTER_ALL, label: 'Todas' }, ...categoryOptions]}
              />
            </div>
          </FilterPanel>

          {filteredTasks.length === 0 ? (
            <TaskTable
              tasks={[]}
              canEdit={canCreate}
              hasAnyTasks={tasks.length > 0}
              filtersActive={filtersActive}
              onClearFilters={handleClearFilters}
            />
          ) : (
            <div className="space-y-6">
              {BUCKET_ORDER.filter((bucket) => bucketedTasks[bucket.key].length > 0).map((bucket) => (
                <div key={bucket.key} className="space-y-2.5">
                  <SectionHeader
                    title={bucket.title}
                    caption={`${bucketedTasks[bucket.key].length} ${bucketedTasks[bucket.key].length === 1 ? 'tarefa' : 'tarefas'}`}
                  />
                  <TaskTable
                    tasks={bucketedTasks[bucket.key]}
                    canEdit={canCreate}
                    busyTaskId={busyTaskId}
                    onMarkCompleted={(taskId) => void handleMarkCompleted(taskId)}
                  />
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

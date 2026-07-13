import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { PageHeader } from '../../../components/layout/PageHeader';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { Badge, Button } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { listTasks } from '../tasks.api';
import type { Task } from '../tasks.types';
import { TaskTable } from '../components/TaskTable';

export function TaskListPage() {
  const { profile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = profile?.roles?.name;
  const canCreate = role === 'admin' || role === 'gestor';

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await listTasks();
        if (active) setTasks(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const pendingTasks = tasks.filter((task) => task.status === 'a_fazer').length;
  const activeTasks = tasks.filter((task) => task.status === 'em_andamento').length;
  const completedTasks = tasks.filter((task) => task.status === 'concluida').length;
  const urgentTasks = tasks.filter((task) => task.priority === 'urgente').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Tarefas"
        description="Acompanhamento operacional de tarefas da equipe."
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
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Total de tarefas" value={tasks.length} tone="brand" />
            <SummaryCard label="Pendentes" value={pendingTasks} />
            <SummaryCard label="Em andamento" value={activeTasks} tone="warning" />
            <SummaryCard label="Concluidas" value={completedTasks} tone="success" />
            <SummaryCard label="Urgentes" value={urgentTasks} tone="warning" />
          </div>
          <FilterBar label="Filtros visuais">
            <Badge tone="brand">{role === 'colaborador' ? 'Minhas tarefas' : 'Escopo por permissao'}</Badge>
            <Badge>Soft delete oculto</Badge>
          </FilterBar>
          <TaskTable tasks={tasks} canEdit={canCreate} />
        </>
      )}
    </div>
  );
}

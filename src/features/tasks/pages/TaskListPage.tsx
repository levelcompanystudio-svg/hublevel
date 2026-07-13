import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { useAuth } from '../../auth/useAuth';
import { listTasks } from '../tasks.api';
import type { Task } from '../tasks.types';
import { TaskHeader } from '../components/TaskHeader';
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

  return (
    <div className="space-y-6">
      <TaskHeader
        title="Tarefas"
        description="Acompanhamento operacional de tarefas da equipe."
        actionLabel={canCreate ? 'Nova tarefa' : undefined}
        actionTo={canCreate ? '/app/tarefas/novo' : undefined}
      />
      {loading && <LoadingState title="Carregando tarefas" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && <TaskTable tasks={tasks} canEdit={canCreate} />}
    </div>
  );
}

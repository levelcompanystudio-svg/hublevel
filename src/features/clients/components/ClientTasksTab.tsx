import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button } from '../../../components/ui';
import { listTasks } from '../../tasks/tasks.api';
import { TaskTable } from '../../tasks/components/TaskTable';
import type { Task } from '../../tasks/tasks.types';

interface ClientTasksTabProps {
  clientId: string;
  canManage: boolean;
}

export function ClientTasksTab({ clientId, canManage }: ClientTasksTabProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Reaproveita a mesma query de tasks.api.ts (sem duplicar logica de negocio),
      // apenas filtrando no cliente para esta aba.
      const result = await listTasks();
      setTasks(result.filter((task) => task.client_id === clientId));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar tarefas do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      {canManage && (
        <div className="flex justify-end">
          <Link to={`/app/tarefas/novo?client_id=${clientId}`}>
            <Button type="button" variant="primary">Nova tarefa</Button>
          </Link>
        </div>
      )}

      {loading && <LoadingState title="Carregando tarefas do cliente" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && <TaskTable tasks={tasks} canEdit={canManage} />}
    </div>
  );
}

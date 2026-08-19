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

const CLOSED_STATUSES = ['concluida', 'cancelada'];

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

// Leitura rapida priorizada: vencidas primeiro, depois demais abertas por prazo, concluidas/
// canceladas por ultimo - sem virar outra central de execucao (isso e /app/tarefas). So reordena
// o mesmo array, nenhuma logica de negocio nova.
function sortForClientTab(tasks: Task[]): Task[] {
  const today = todayDateOnly();
  const rank = (task: Task) => {
    const isClosed = CLOSED_STATUSES.includes(task.status);
    if (isClosed) return 2;
    if (task.due_date && task.due_date < today) return 0;
    return 1;
  };
  return [...tasks].sort((a, b) => {
    const rankDiff = rank(a) - rank(b);
    if (rankDiff !== 0) return rankDiff;
    return (a.due_date ?? '9999-99-99').localeCompare(b.due_date ?? '9999-99-99');
  });
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
      setTasks(sortForClientTab(result.filter((task) => task.client_id === clientId)));
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

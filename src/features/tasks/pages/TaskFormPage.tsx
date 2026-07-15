import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createTask, getTask, listAssignableProfiles, listTaskClients, updateTask } from '../tasks.api';
import type { TaskClient, TaskFormValues, TaskProfile } from '../tasks.types';
import { emptyTaskFormValues } from '../tasks.types';
import { TaskForm } from '../components/TaskForm';
import { TaskHeader } from '../components/TaskHeader';

export function TaskFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client_id') ?? '';
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [values, setValues] = useState<TaskFormValues>(emptyTaskFormValues);
  const [clients, setClients] = useState<TaskClient[]>([]);
  const [assignees, setAssignees] = useState<TaskProfile[]>([]);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const role = profile?.roles?.name;
  const canEdit = role === 'admin' || role === 'gestor';
  const editing = Boolean(id);

  useEffect(() => {
    if (!profile || !role || !canEdit) {
      setLoading(false);
      return;
    }
    let active = true;
    const currentProfile = profile;
    const currentRole = role;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [clientRows, assigneeRows, task] = await Promise.all([
          listTaskClients(),
          listAssignableProfiles(currentProfile.id, currentRole),
          id ? getTask(id) : Promise.resolve(null),
        ]);
        if (!active) return;
        setClients(clientRows);
        setAssignees(assigneeRows);
        if (task) {
          setCompletedAt(task.completed_at);
          setValues({
            client_id: task.client_id ?? '',
            title: task.title,
            description: task.description ?? '',
            assigned_to_user_id: task.assigned_to_user_id ?? '',
            priority: task.priority,
            status: task.status,
            due_date: task.due_date ?? '',
            category: task.category ?? '',
            notes: task.notes ?? '',
          });
        } else {
          setCompletedAt(null);
          setValues({ ...emptyTaskFormValues, client_id: preselectedClientId });
        }
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao preparar formulario de tarefa.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canEdit, id, preselectedClientId, profile, role]);

  async function handleSubmit() {
    if (!profile) return;
    try {
      setSaving(true);
      setError(null);
      const saved = id
        ? await updateTask(id, values, completedAt)
        : await createTask(values, profile.id);
      navigate(`/app/tarefas/${saved.id}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar tarefa.');
    } finally {
      setSaving(false);
    }
  }

  if (!canEdit) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-6">
      <TaskHeader title={editing ? 'Editar tarefa' : 'Nova tarefa'} description="Cadastro e manutencao operacional de tarefas." />
      {loading && <LoadingState title="Preparando formulario" />}
      {error && <ErrorState description={error} />}
      {!loading && <TaskForm values={values} clients={clients} assignees={assignees} loading={saving} submitLabel={editing ? 'Salvar alteracoes' : 'Criar tarefa'} onChange={setValues} onSubmit={handleSubmit} />}
    </div>
  );
}

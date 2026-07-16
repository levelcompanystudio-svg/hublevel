import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createDeliverable, getDeliverable, listAssignableProfiles, listDeliverableClients, updateDeliverable } from '../deliverables.api';
import { emptyDeliverableFormValues } from '../deliverables.types';
import type { DeliverableClient, DeliverableFormValues, DeliverableProfile } from '../deliverables.types';
import { DeliverableForm } from '../components/DeliverableForm';
import { DeliverableHeader } from '../components/DeliverableHeader';

export function DeliverableFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client_id') ?? '';
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [values, setValues] = useState<DeliverableFormValues>(emptyDeliverableFormValues);
  const [clients, setClients] = useState<DeliverableClient[]>([]);
  const [assignees, setAssignees] = useState<DeliverableProfile[]>([]);
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
        const [clientRows, assigneeRows, deliverable] = await Promise.all([
          listDeliverableClients(),
          listAssignableProfiles(currentProfile.id, currentRole),
          id ? getDeliverable(id) : Promise.resolve(null),
        ]);
        if (!active) return;
        setClients(clientRows);
        setAssignees(assigneeRows);
        if (deliverable) {
          setCompletedAt(deliverable.completed_at);
          setValues({
            client_id: deliverable.client_id,
            title: deliverable.title,
            description: deliverable.description ?? '',
            status: deliverable.status,
            priority: deliverable.priority,
            reference_month: deliverable.reference_month ?? '',
            due_date: deliverable.due_date ?? '',
            assigned_to: deliverable.assigned_to ?? '',
            notes: deliverable.notes ?? '',
          });
        } else {
          setCompletedAt(null);
          setValues({ ...emptyDeliverableFormValues, client_id: preselectedClientId });
        }
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao preparar formulario de entregavel.');
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
        ? await updateDeliverable(id, values, profile.id, completedAt)
        : await createDeliverable(values, profile.id);
      navigate(`/app/entregaveis/${saved.id}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar entregavel.');
    } finally {
      setSaving(false);
    }
  }

  if (!canEdit) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-6">
      <DeliverableHeader
        title={editing ? 'Editar entregavel' : 'Novo entregavel'}
        description="Cadastro e manutencao de entregaveis por cliente."
      />
      {loading && <LoadingState title="Preparando formulario" />}
      {error && <ErrorState description={error} />}
      {!loading && (
        <DeliverableForm
          values={values}
          clients={clients}
          assignees={assignees}
          loading={saving}
          submitLabel={editing ? 'Salvar alteracoes' : 'Criar entregavel'}
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

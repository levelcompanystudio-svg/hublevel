import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createUpdate, getUpdate, listUpdateClients, listUpdateResponsibles, updateUpdate } from '../updates.api';
import type { UpdateClientRef, UpdateFormValues, UpdateResponsibleRef } from '../updates.types';
import { createEmptyUpdateFormValues, validateUpdateForm } from '../updates.types';
import { UpdateForm } from '../components/UpdateForm';
import { UpdateHeader } from '../components/UpdateHeader';

export function UpdateFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client_id') ?? '';
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [values, setValues] = useState<UpdateFormValues>(createEmptyUpdateFormValues());
  const [clients, setClients] = useState<UpdateClientRef[]>([]);
  const [responsibles, setResponsibles] = useState<UpdateResponsibleRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;
  const editing = Boolean(id);
  const canAccess = role === 'admin' || role === 'gestor';
  const canChooseResponsible = role === 'admin';

  useEffect(() => {
    if (!profile || !canAccess) {
      setLoading(false);
      return;
    }

    let active = true;
    const currentProfile = profile;

    async function loadFormData() {
      try {
        setLoading(true);
        setError(null);

        const [clientRows, responsibleRows, update] = await Promise.all([
          listUpdateClients(),
          listUpdateResponsibles(),
          id ? getUpdate(id) : Promise.resolve(null),
        ]);

        if (!active) return;

        setClients(clientRows);
        setResponsibles(responsibleRows);

        if (update) {
          setValues({
            client_id: update.client_id,
            title: update.title,
            description: update.description,
            category: update.category ?? '',
            responsible_user_id: role === 'gestor' ? currentProfile.id : update.responsible_user_id,
            status: update.status,
            update_date: update.update_date,
            next_action: update.next_action ?? '',
            sent_to_client: update.sent_to_client,
          });
        } else {
          setValues({
            ...createEmptyUpdateFormValues(role === 'gestor' ? currentProfile.id : ''),
            client_id: preselectedClientId,
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao preparar formulario de acompanhamento.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFormData();

    return () => {
      active = false;
    };
  }, [canAccess, id, preselectedClientId, profile, role]);

  async function handleSubmit() {
    if (!profile) return;

    const payload: UpdateFormValues = {
      ...values,
      responsible_user_id: role === 'gestor' ? profile.id : values.responsible_user_id,
    };

    const validationError = validateUpdateForm(payload);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const saved = id
        ? await updateUpdate(id, payload)
        : await createUpdate(payload);

      navigate(`/app/acompanhamento/${saved.id}`, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar atualizacao.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (!canAccess) {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <UpdateHeader
        title={editing ? 'Editar atualizacao' : 'Nova atualizacao'}
        description={editing ? 'Atualize o registro de acompanhamento do cliente.' : 'Registre uma nova atualizacao de acompanhamento para um cliente.'}
      />

      {loading && <LoadingState title="Preparando formulario" />}
      {error && <ErrorState description={error} />}
      {!loading && (
        <UpdateForm
          values={values}
          clients={clients}
          responsibles={responsibles}
          canChooseResponsible={canChooseResponsible}
          loading={saving}
          submitLabel={editing ? 'Salvar alteracoes' : 'Registrar atualizacao'}
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

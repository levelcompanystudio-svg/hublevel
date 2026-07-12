import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createService, getService, updateService } from '../services.api';
import type { ServiceFormValues } from '../services.types';
import { emptyServiceFormValues } from '../services.types';
import { ServiceForm } from '../components/ServiceForm';
import { ServiceHeader } from '../components/ServiceHeader';

export function ServiceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [values, setValues] = useState<ServiceFormValues>(emptyServiceFormValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;
  const canEdit = role === 'admin';
  const editing = Boolean(id);

  useEffect(() => {
    if (!canEdit) {
      setLoading(false);
      return;
    }

    if (!id) {
      setValues(emptyServiceFormValues);
      setLoading(false);
      return;
    }

    let active = true;
    const serviceId = id;

    async function loadService() {
      try {
        setLoading(true);
        setError(null);
        const service = await getService(serviceId, true);
        if (!active) return;
        setValues({
          name: service.name,
          description: service.description ?? '',
          category: service.category ?? '',
          default_price: service.default_price === null ? '' : String(service.default_price),
          billing_cycle: service.billing_cycle ?? '',
          status: service.status,
          notes: service.notes ?? '',
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar formulario de servico.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadService();

    return () => {
      active = false;
    };
  }, [canEdit, id]);

  async function handleSubmit() {
    try {
      setSaving(true);
      setError(null);
      const saved = id
        ? await updateService(id, values)
        : await createService(values);

      navigate(`/app/servicos/${saved.id}`, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar servico.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (!canEdit) {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <ServiceHeader
        title={editing ? 'Editar servico' : 'Novo servico'}
        description={editing ? 'Atualize os dados do catalogo interno.' : 'Cadastre um servico para uso operacional e contratos futuros.'}
      />

      {loading && <LoadingState title="Preparando formulario" />}
      {error && <ErrorState description={error} />}
      {!loading && (
        <ServiceForm
          values={values}
          loading={saving}
          submitLabel={editing ? 'Salvar alteracoes' : 'Criar servico'}
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

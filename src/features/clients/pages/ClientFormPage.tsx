import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createClient, getClient, listResponsibleProfiles, updateClient } from '../clients.api';
import type { ClientFormValues, ResponsibleProfile } from '../clients.types';
import { emptyClientFormValues } from '../clients.types';
import { ClientForm } from '../components/ClientForm';
import { ClientHeader } from '../components/ClientHeader';

export function ClientFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [values, setValues] = useState<ClientFormValues>(emptyClientFormValues);
  const [responsibleProfiles, setResponsibleProfiles] = useState<ResponsibleProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;
  const editing = Boolean(id);
  const canChooseResponsible = role === 'admin';

  const currentUserResponsible = useMemo<ResponsibleProfile | null>(() => {
    if (!profile) return null;
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      roles: profile.roles ? { name: profile.roles.name } : undefined,
    };
  }, [profile]);

  useEffect(() => {
    if (!profile || (role !== 'admin' && role !== 'gestor')) {
      setLoading(false);
      return;
    }

    let active = true;
    const currentProfile = profile;

    async function loadFormData() {
      try {
        setLoading(true);
        setError(null);

        const [responsibles, client] = await Promise.all([
          role === 'admin' ? listResponsibleProfiles() : Promise.resolve(currentUserResponsible ? [currentUserResponsible] : []),
          id ? getClient(id) : Promise.resolve(null),
        ]);

        if (!active) return;

        setResponsibleProfiles(responsibles);

        if (client) {
          setValues({
            company_name: client.company_name,
            trade_name: client.trade_name ?? '',
            document_number: client.document_number ?? '',
            segment: client.segment ?? '',
            status: client.status,
            responsible_user_id: role === 'gestor' ? currentProfile.id : client.responsible_user_id,
            health_status: client.health_status,
            start_date: client.start_date ?? '',
            end_date: client.end_date ?? '',
            notes: client.notes ?? '',
          });
        } else {
          setValues({
            ...emptyClientFormValues,
            responsible_user_id: role === 'gestor' ? currentProfile.id : '',
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar formulario de cliente.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFormData();

    return () => {
      active = false;
    };
  }, [currentUserResponsible, id, profile, role]);

  async function handleSubmit() {
    if (!profile) return;

    const payload: ClientFormValues = {
      ...values,
      responsible_user_id: role === 'gestor' ? profile.id : values.responsible_user_id,
    };

    try {
      setSaving(true);
      setError(null);
      const saved = id
        ? await updateClient(id, payload, profile.id)
        : await createClient(payload, profile.id);

      navigate(`/app/clientes/${saved.id}`, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar cliente.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (role !== 'admin' && role !== 'gestor') {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <ClientHeader
        title={editing ? 'Editar cliente' : 'Novo cliente'}
        description={editing ? 'Atualize os dados basicos do cliente.' : 'Cadastre um novo cliente na carteira operacional.'}
      />

      {loading && <LoadingState title="Preparando formulario" />}
      {error && <ErrorState description={error} />}
      {!loading && (
        <ClientForm
          values={values}
          responsibleProfiles={responsibleProfiles}
          canChooseResponsible={canChooseResponsible}
          loading={saving}
          submitLabel={editing ? 'Salvar alteracoes' : 'Criar cliente'}
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

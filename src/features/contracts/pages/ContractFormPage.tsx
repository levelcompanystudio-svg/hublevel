import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createContract, getContract, listContractClients, updateContract } from '../contracts.api';
import type { ContractClient, ContractFormValues } from '../contracts.types';
import { emptyContractFormValues, validateContractForm } from '../contracts.types';
import { ContractForm } from '../components/ContractForm';
import { ContractHeader } from '../components/ContractHeader';

export function ContractFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [values, setValues] = useState<ContractFormValues>(emptyContractFormValues);
  const [clients, setClients] = useState<ContractClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canAccess = profile?.roles?.name === 'admin';
  const editing = Boolean(id);

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [clientRows, contract] = await Promise.all([
          listContractClients(),
          id ? getContract(id) : Promise.resolve(null),
        ]);
        if (!active) return;
        setClients(clientRows);
        if (contract) {
          setValues({
            client_id: contract.client_id,
            status: contract.status,
            start_date: contract.start_date,
            end_date: contract.end_date ?? '',
            monthly_value: String(contract.monthly_value),
            billing_day: String(contract.billing_day),
            notice_period_days: contract.notice_period_days !== null ? String(contract.notice_period_days) : '',
            notes: contract.notes ?? '',
          });
        } else {
          setValues(emptyContractFormValues);
        }
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao preparar formulario de contrato.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canAccess, id]);

  async function handleSubmit() {
    if (!profile) return;

    const validationError = validateContractForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const saved = id
        ? await updateContract(id, values, profile.id)
        : await createContract(values, profile.id);
      navigate(`/app/contratos/${saved.id}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar contrato.');
    } finally {
      setSaving(false);
    }
  }

  if (!canAccess) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-6">
      <ContractHeader
        title={editing ? 'Editar contrato' : 'Novo contrato'}
        description={editing ? 'Atualize os dados administrativos do contrato.' : 'Cadastre um novo contrato vinculado a um cliente.'}
      />
      {loading && <LoadingState title="Preparando formulario" />}
      {error && <ErrorState description={error} />}
      {!loading && (
        <ContractForm
          values={values}
          clients={clients}
          loading={saving}
          submitLabel={editing ? 'Salvar alteracoes' : 'Criar contrato'}
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createFinancialRecord, getFinancialRecord, listFinanceClients, updateFinancialRecord } from '../finance.api';
import type { FinanceClient, FinancialRecordFormValues } from '../finance.types';
import { emptyFinancialRecordFormValues } from '../finance.types';
import { FinanceForm } from '../components/FinanceForm';
import { FinanceHeader } from '../components/FinanceHeader';

export function FinanceFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [values, setValues] = useState<FinancialRecordFormValues>(emptyFinancialRecordFormValues);
  const [clients, setClients] = useState<FinanceClient[]>([]);
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
        const [clientRows, record] = await Promise.all([
          listFinanceClients(),
          id ? getFinancialRecord(id) : Promise.resolve(null),
        ]);
        if (!active) return;
        setClients(clientRows);
        if (record) {
          setValues({
            client_id: record.client_id,
            competence_month: record.competence_month.slice(0, 7),
            description: record.description ?? '',
            amount: String(record.amount),
            due_date: record.due_date,
            status: record.status,
            notes: record.notes ?? '',
          });
        } else {
          setValues(emptyFinancialRecordFormValues);
        }
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao preparar formulario financeiro.');
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
    try {
      setSaving(true);
      setError(null);
      const saved = id
        ? await updateFinancialRecord(id, values, profile.id)
        : await createFinancialRecord(values, profile.id);
      navigate(`/app/financeiro/${saved.id}`, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar registro financeiro.');
    } finally {
      setSaving(false);
    }
  }

  if (!canAccess) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-6">
      <FinanceHeader title={editing ? 'Editar registro financeiro' : 'Novo registro financeiro'} description="Controle financeiro administrativo da Level Company." />
      {loading && <LoadingState title="Preparando formulario" />}
      {error && <ErrorState description={error} />}
      {!loading && <FinanceForm values={values} clients={clients} loading={saving} submitLabel={editing ? 'Salvar alteracoes' : 'Criar registro'} onChange={setValues} onSubmit={handleSubmit} />}
    </div>
  );
}

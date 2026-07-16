import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { getDeliverable, updateDeliverableStatus } from '../deliverables.api';
import { COLABORADOR_ALLOWED_STATUSES } from '../deliverables.types';
import type { Deliverable, DeliverableStatus } from '../deliverables.types';
import { assigneeName, clientName, formatDate } from '../components/DeliverableTable';
import { DeliverableHeader } from '../components/DeliverableHeader';
import { DeliverablePriorityBadge } from '../components/DeliverablePriorityBadge';
import { DeliverableStatusBadge } from '../components/DeliverableStatusBadge';
import { DeliverableStatusUpdateForm } from '../components/DeliverableStatusUpdateForm';

export function DeliverableDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [deliverable, setDeliverable] = useState<Deliverable | null>(null);
  const [statusValue, setStatusValue] = useState<DeliverableStatus>('pending');
  const [loading, setLoading] = useState(true);
  const [savingStatus, setSavingStatus] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const role = profile?.roles?.name;
  const canEditGeneral = role === 'admin' || role === 'gestor';
  const canUpdateStatusOnly = role === 'colaborador';

  async function loadDeliverable(deliverableId: string, active = true) {
    try {
      setLoading(true);
      setError(null);
      const result = await getDeliverable(deliverableId);
      if (!active) return;
      setDeliverable(result);
      setStatusValue(COLABORADOR_ALLOWED_STATUSES.includes(result.status) ? result.status : 'in_progress');
    } catch (err: unknown) {
      if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar entregavel.');
    } finally {
      if (active) setLoading(false);
    }
  }

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    let active = true;
    void loadDeliverable(id, active);
    return () => {
      active = false;
    };
  }, [id]);

  async function handleStatusSubmit() {
    if (!id || !profile) return;
    if (!COLABORADOR_ALLOWED_STATUSES.includes(statusValue)) {
      setError('Colaborador pode marcar entregaveis apenas como em andamento ou entregue.');
      return;
    }

    try {
      setSavingStatus(true);
      setError(null);
      const updated = await updateDeliverableStatus(id, statusValue, profile.id);
      setDeliverable(updated);
      setStatusValue(updated.status);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status do entregavel.');
    } finally {
      setSavingStatus(false);
    }
  }

  return (
    <div className="space-y-6">
      <DeliverableHeader title={deliverable?.title ?? 'Entregavel'} description="Detalhe do entregavel." />
      {loading && <LoadingState title="Carregando entregavel" />}
      {error && <ErrorState description={error} />}
      {!loading && deliverable && (
        <>
          <Card>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <DeliverableStatusBadge status={deliverable.status} />
                  <DeliverablePriorityBadge priority={deliverable.priority} />
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{deliverable.description || 'Sem descricao cadastrada.'}</p>
              </div>
              {canEditGeneral && (
                <Link to={`/app/entregaveis/${deliverable.id}/editar`}>
                  <Button type="button">Editar entregavel</Button>
                </Link>
              )}
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Cliente" value={clientName(deliverable)} to={`/app/clientes/${deliverable.client_id}`} />
              <InfoItem label="Responsavel" value={assigneeName(deliverable)} />
              <InfoItem label="Prazo" value={formatDate(deliverable.due_date)} />
              <InfoItem label="Mes de referencia" value={formatDate(deliverable.reference_month)} />
              <InfoItem
                label="Entregue em"
                value={deliverable.completed_at ? new Intl.DateTimeFormat('pt-BR').format(new Date(deliverable.completed_at)) : '-'}
              />
            </div>
            <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Observacoes</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{deliverable.notes || 'Nenhuma observacao cadastrada.'}</p>
            </div>
          </Card>
          {canUpdateStatusOnly && (
            <DeliverableStatusUpdateForm status={statusValue} loading={savingStatus} onChange={setStatusValue} onSubmit={handleStatusSubmit} />
          )}
        </>
      )}
    </div>
  );
}

function InfoItem({ label, value, to }: { label: string; value: string; to?: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      {to ? (
        <Link to={to} className="mt-1 block truncate text-sm font-semibold text-primary hover:underline">
          {value}
        </Link>
      ) : (
        <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
      )}
    </div>
  );
}

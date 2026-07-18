import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Badge } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import {
  createDeliverable,
  listAssignableProfiles,
  listDeliverableClients,
  listDeliverables,
} from '../deliverables.api';
import type { Deliverable, DeliverableClient, DeliverableFormValues, DeliverableProfile } from '../deliverables.types';
import { DeliverableClientBoard } from '../components/DeliverableClientBoard';
import { DeliverableSummary } from '../components/DeliverableSummary';
import { DeliverableTable } from '../components/DeliverableTable';

export function DeliverableListPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  const canCreate = role === 'admin' || role === 'gestor';

  const [items, setItems] = useState<Deliverable[]>([]);
  const [clients, setClients] = useState<DeliverableClient[]>([]);
  const [assignees, setAssignees] = useState<DeliverableProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!profile || !role) return;

    let active = true;
    const profileId = profile.id;
    async function load() {
      try {
        setLoading(true);
        setError(null);

        const [deliverablesResult, clientsResult, assigneesResult] = await Promise.all([
          listDeliverables(),
          canCreate ? listDeliverableClients() : Promise.resolve([]),
          canCreate ? listAssignableProfiles(profileId, role) : Promise.resolve([]),
        ]);

        if (!active) return;
        setItems(deliverablesResult);
        setClients(clientsResult);
        setAssignees(assigneesResult);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar entregaveis.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canCreate, profile?.id, role]);

  async function handleCreate(values: DeliverableFormValues) {
    if (!profile) return;

    try {
      setSaving(true);
      setError(null);
      const created = await createDeliverable(values, profile.id);
      setItems((current) => [...current, created].sort((a, b) => (a.due_date ?? '9999-12-31').localeCompare(b.due_date ?? '9999-12-31')));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar entregavel.');
      throw err;
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operacao"
        title="Entregaveis"
        description={canCreate ? 'Entregas por cliente - sem ordem fixa.' : 'Entregaveis atribuidos a voce.'}
      />

      {loading && <LoadingState title="Carregando entregaveis" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && canCreate && profile && (
        <DeliverableClientBoard
          clients={clients}
          items={items}
          assignees={assignees}
          currentUserId={profile.id}
          saving={saving}
          onCreate={handleCreate}
        />
      )}
      {!loading && !error && !canCreate && (
        <>
          <DeliverableSummary items={items} />
          <div className="flex items-center gap-2">
            <Badge tone="brand">Meus entregaveis</Badge>
          </div>
          <DeliverableTable items={items} canEdit={false} />
        </>
      )}
    </div>
  );
}

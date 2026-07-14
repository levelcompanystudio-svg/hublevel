import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { PageHeader } from '../../../components/layout/PageHeader';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { Badge, Button } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listUpdates } from '../updates.api';
import type { Update } from '../updates.types';
import { UpdateTable } from '../components/UpdateTable';

export function UpdateListPage() {
  const { profile } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

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
        const result = await listUpdates();
        if (active) setUpdates(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar atualizacoes.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canAccess]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  const draftUpdates = updates.filter((update) => update.status === 'rascunho').length;
  const registeredUpdates = updates.filter((update) => update.status === 'registrada').length;
  const sentUpdates = updates.filter((update) => update.status === 'enviada').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Acompanhamento"
        description="Registro semanal de atualizacoes por cliente da carteira."
        action={(
          <Link to="/app/acompanhamento/novo">
            <Button type="button" variant="primary">Nova atualizacao</Button>
          </Link>
        )}
      />

      {loading && <LoadingState title="Carregando atualizacoes" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Total de atualizacoes" value={updates.length} tone="brand" />
            <SummaryCard label="Enviadas ao cliente" value={sentUpdates} tone="success" />
            <SummaryCard label="Registradas" value={registeredUpdates} />
            <SummaryCard label="Rascunhos" value={draftUpdates} tone="warning" />
          </div>
          <FilterBar label="Filtros visuais">
            <Badge tone="brand">{role === 'admin' ? 'Todos os clientes' : 'Minha carteira'}</Badge>
            <Badge>Rotina semanal</Badge>
          </FilterBar>
          <UpdateTable updates={updates} />
        </>
      )}
    </div>
  );
}

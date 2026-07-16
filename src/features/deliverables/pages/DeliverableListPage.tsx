import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Badge, Button } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { listDeliverables } from '../deliverables.api';
import type { Deliverable } from '../deliverables.types';
import { DeliverableSummary } from '../components/DeliverableSummary';
import { DeliverableTable } from '../components/DeliverableTable';

export function DeliverableListPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  // Sem gate de acesso: admin ve tudo, gestor ve os proprios clientes e colaborador ve
  // apenas os entregaveis atribuidos a ele, tudo resolvido pela RLS da tabela `deliverables`.
  const canCreate = role === 'admin' || role === 'gestor';

  const [items, setItems] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await listDeliverables();
        if (active) setItems(result);
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
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Entregaveis"
        description="Entregaveis por cliente: itens combinados, prazos e status de entrega."
        action={canCreate ? (
          <Link to="/app/entregaveis/novo">
            <Button type="button" variant="primary">Novo entregavel</Button>
          </Link>
        ) : undefined}
      />

      {loading && <LoadingState title="Carregando entregaveis" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <DeliverableSummary items={items} />
          <div className="flex items-center gap-2">
            <Badge tone="brand">{role === 'colaborador' ? 'Meus entregaveis' : role === 'admin' ? 'Todos os clientes' : 'Minha carteira'}</Badge>
          </div>
          <DeliverableTable items={items} canEdit={canCreate} />
        </>
      )}
    </div>
  );
}

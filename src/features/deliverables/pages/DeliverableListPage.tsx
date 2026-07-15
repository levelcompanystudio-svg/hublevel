import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { Badge } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listDeliverables } from '../deliverables.api';
import type { Deliverable } from '../deliverables.types';
import { DeliverableHeader } from '../components/DeliverableHeader';
import { DeliverableSummary } from '../components/DeliverableSummary';
import { DeliverableTable } from '../components/DeliverableTable';

type DeliverableFilter = 'todos' | 'pendentes' | 'concluidos' | 'vencidos' | 'documentos' | 'tarefas';

const filters: Array<{ label: string; value: DeliverableFilter }> = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendentes', value: 'pendentes' },
  { label: 'Concluidos', value: 'concluidos' },
  { label: 'Vencidos', value: 'vencidos' },
  { label: 'Documentos', value: 'documentos' },
  { label: 'Tarefas', value: 'tarefas' },
];

export function DeliverableListPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  // Colaborador nao tem policy de SELECT em `documents`/`updates` (so admin/gestor tem),
  // entao a visao ficaria incompleta e inconsistente. Bloqueado no modulo global por ora.
  const canAccess = role === 'admin' || role === 'gestor';

  const [items, setItems] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<DeliverableFilter>('todos');

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
  }, [canAccess]);

  const filteredItems = useMemo(() => {
    switch (activeFilter) {
      case 'pendentes':
        return items.filter((item) => item.status === 'pendente' || item.status === 'em_andamento');
      case 'concluidos':
        return items.filter((item) => item.status === 'concluido');
      case 'vencidos':
        return items.filter((item) => item.status === 'vencido');
      case 'documentos':
        return items.filter((item) => item.origin === 'documento');
      case 'tarefas':
        return items.filter((item) => item.origin === 'tarefa');
      default:
        return items;
    }
  }, [activeFilter, items]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-6">
      <DeliverableHeader
        title="Entregaveis"
        description="Visao consolidada de tarefas de entrega, documentos operacionais e atualizacoes enviadas ao cliente."
      />

      {loading && <LoadingState title="Carregando entregaveis" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <DeliverableSummary items={items} />

          <FilterBar label={role === 'admin' ? 'Todos os clientes' : 'Minha carteira'}>
            <div className="flex flex-wrap gap-1.5">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    activeFilter === filter.value
                      ? 'border-primary/60 bg-primary text-primary-foreground shadow-[0_4px_14px_-4px_var(--color-primary)]'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <Badge>Derivado de tarefas, documentos e atualizacoes</Badge>
          </FilterBar>

          <DeliverableTable items={filteredItems} />
        </>
      )}
    </div>
  );
}

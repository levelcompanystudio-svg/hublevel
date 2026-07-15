import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { Badge } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { listChecklistItems } from '../checklist.api';
import { getChecklistBucket } from '../checklist.types';
import type { ChecklistFilter, ChecklistItem } from '../checklist.types';
import { ChecklistHeader } from '../components/ChecklistHeader';
import { ChecklistSummary } from '../components/ChecklistSummary';
import { ChecklistTable } from '../components/ChecklistTable';

const filters: Array<{ label: string; value: ChecklistFilter }> = [
  { label: 'Todos', value: 'todos' },
  { label: 'Pendentes', value: 'pendente' },
  { label: 'Em andamento', value: 'em_andamento' },
  { label: 'Concluidos', value: 'concluido' },
  { label: 'Vencidos', value: 'vencido' },
];

export function ChecklistPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;

  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ChecklistFilter>('todos');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await listChecklistItems();
        if (active) setItems(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar checklist operacional.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, []);

  const filteredItems = useMemo(() => {
    if (activeFilter === 'todos') return items;
    return items.filter((item) => getChecklistBucket(item) === activeFilter);
  }, [activeFilter, items]);

  return (
    <div className="space-y-6">
      <ChecklistHeader
        title="Checklist operacional"
        description="Entregaveis e pendencias por cliente, derivados das tarefas cadastradas na operacao."
      />

      {loading && <LoadingState title="Carregando checklist" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <ChecklistSummary items={items} />

          <FilterBar label={role === 'colaborador' ? 'Meus itens' : role === 'admin' ? 'Todos os clientes' : 'Minha carteira'}>
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
            <Badge>Baseado em Tarefas</Badge>
          </FilterBar>

          <ChecklistTable items={filteredItems} />
        </>
      )}
    </div>
  );
}

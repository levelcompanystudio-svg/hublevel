import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { PageHeader } from '../../../components/layout/PageHeader';
import { StatsGrid } from '../../../components/layout/StatsGrid';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { Button } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listUpdates } from '../updates.api';
import type { Update, UpdateStatus } from '../updates.types';
import { UpdateTable } from '../components/UpdateTable';
import { updateStatusLabels } from '../components/UpdateStatusBadge';

const FILTER_ALL = 'todos';
type QuickFilter = 'todos' | 'com_proxima_acao' | 'sem_proxima_acao';

function hasNextAction(update: Update): boolean {
  return Boolean(update.next_action?.trim());
}

interface FilterSelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}

function FilterSelect<T extends string>({ label, value, onChange, options }: FilterSelectProps<T>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

export function UpdateListPage() {
  const { profile } = useAuth();
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  const [quickFilter, setQuickFilter] = useState<QuickFilter>('todos');
  const [statusFilter, setStatusFilter] = useState<UpdateStatus | 'todos'>(FILTER_ALL);
  const [categoryFilter, setCategoryFilter] = useState<string>(FILTER_ALL);
  const [clientFilter, setClientFilter] = useState<string>(FILTER_ALL);
  const [responsibleFilter, setResponsibleFilter] = useState<string>(FILTER_ALL);

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

  function handleClearFilters() {
    setQuickFilter('todos');
    setStatusFilter(FILTER_ALL);
    setCategoryFilter(FILTER_ALL);
    setClientFilter(FILTER_ALL);
    setResponsibleFilter(FILTER_ALL);
  }

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const update of updates) {
      if (update.category?.trim()) set.add(update.category.trim());
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [updates]);

  const clientOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const update of updates) {
      const client = Array.isArray(update.client) ? update.client[0] : update.client;
      if (client) map.set(update.client_id, client.trade_name || client.company_name);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [updates]);

  const responsibleOptions = useMemo(() => {
    const map = new Map<string, string>();
    for (const update of updates) {
      const responsible = Array.isArray(update.responsible) ? update.responsible[0] : update.responsible;
      if (responsible) map.set(responsible.id, responsible.name);
    }
    return Array.from(map.entries())
      .map(([value, label]) => ({ value, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [updates]);

  const filtersActive =
    quickFilter !== 'todos' ||
    statusFilter !== FILTER_ALL ||
    categoryFilter !== FILTER_ALL ||
    clientFilter !== FILTER_ALL ||
    responsibleFilter !== FILTER_ALL;

  const filteredUpdates = useMemo(() => {
    return updates.filter((update) => {
      const matchesQuick =
        quickFilter === 'todos' ||
        (quickFilter === 'com_proxima_acao' && hasNextAction(update)) ||
        (quickFilter === 'sem_proxima_acao' && !hasNextAction(update));

      if (!matchesQuick) return false;
      if (statusFilter !== FILTER_ALL && update.status !== statusFilter) return false;
      if (categoryFilter !== FILTER_ALL && (update.category?.trim() || '') !== categoryFilter) return false;
      if (clientFilter !== FILTER_ALL && update.client_id !== clientFilter) return false;
      if (responsibleFilter !== FILTER_ALL && update.responsible_user_id !== responsibleFilter) return false;
      return true;
    });
  }, [updates, quickFilter, statusFilter, categoryFilter, clientFilter, responsibleFilter]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  const draftUpdates = updates.filter((update) => update.status === 'rascunho').length;
  const sentUpdates = updates.filter((update) => update.status === 'enviada').length;
  const withNextAction = updates.filter((update) => hasNextAction(update)).length;
  const withoutNextAction = updates.length - withNextAction;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operacao"
        title="Acompanhamento"
        description="Central de follow-up e historico de atualizacoes por cliente da carteira."
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
          <StatsGrid className="sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            <SummaryCard label="Total de atualizacoes" value={updates.length} tone="brand" />
            <SummaryCard label="Pendentes (rascunho)" value={draftUpdates} tone={draftUpdates > 0 ? 'warning' : 'neutral'} />
            <SummaryCard label="Enviadas ao cliente" value={sentUpdates} tone="success" />
            <SummaryCard label="Com proxima acao" value={withNextAction} tone="neutral" />
            <SummaryCard label="Sem proxima acao" value={withoutNextAction} tone="neutral" />
          </StatsGrid>

          <FilterBar label="Visao rapida">
            <div className="flex flex-wrap gap-1.5">
              {([
                { value: 'todos', label: 'Todas' },
                { value: 'com_proxima_acao', label: 'Com proxima acao' },
                { value: 'sem_proxima_acao', label: 'Sem proxima acao' },
              ] as Array<{ value: QuickFilter; label: string }>).map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setQuickFilter(filter.value)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    quickFilter === filter.value
                      ? 'border-primary/60 bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </FilterBar>

          <FilterBar label="Filtros">
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
              <FilterSelect
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: FILTER_ALL, label: 'Todos' },
                  ...(Object.keys(updateStatusLabels) as UpdateStatus[]).map((option) => ({ value: option, label: updateStatusLabels[option] })),
                ]}
              />
              <FilterSelect
                label="Categoria"
                value={categoryFilter}
                onChange={setCategoryFilter}
                options={[{ value: FILTER_ALL, label: 'Todas' }, ...categoryOptions.map((option) => ({ value: option, label: option }))]}
              />
              <FilterSelect
                label="Cliente"
                value={clientFilter}
                onChange={setClientFilter}
                options={[{ value: FILTER_ALL, label: 'Todos' }, ...clientOptions]}
              />
              <FilterSelect
                label="Responsavel"
                value={responsibleFilter}
                onChange={setResponsibleFilter}
                options={[{ value: FILTER_ALL, label: 'Todos' }, ...responsibleOptions]}
              />
            </div>
            {filtersActive && (
              <Button type="button" variant="ghost" size="sm" onClick={handleClearFilters} className="shrink-0">
                Limpar filtros
              </Button>
            )}
          </FilterBar>

          <UpdateTable
            updates={filteredUpdates}
            hasAnyUpdates={updates.length > 0}
            filtersActive={filtersActive}
            onClearFilters={handleClearFilters}
          />
        </>
      )}
    </div>
  );
}

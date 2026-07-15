import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getClientAggregate, getClientAggregates } from '../client-aggregates.api';
import type { ClientAggregate } from '../client-aggregates.types';
import { listClients } from '../clients.api';
import type { Client } from '../clients.types';
import { ClientCard } from '../components/ClientCard';
import { ClientSummaryGrid, getClientSummary } from '../components/ClientSummaryGrid';

type ClientFilter =
  | 'todos'
  | 'saudaveis'
  | 'atencao'
  | 'criticos'
  | 'onboarding'
  | 'recentes'
  | 'sem_atualizacao'
  | 'sem_reuniao'
  | 'tarefa_vencida';

const filters: Array<{ label: string; value: ClientFilter }> = [
  { label: 'Todos', value: 'todos' },
  { label: 'Saudaveis', value: 'saudaveis' },
  { label: 'Atencao', value: 'atencao' },
  { label: 'Criticos', value: 'criticos' },
  { label: 'Onboarding', value: 'onboarding' },
  { label: 'Recentes', value: 'recentes' },
  { label: 'Sem atualizacao', value: 'sem_atualizacao' },
  { label: 'Sem reuniao', value: 'sem_reuniao' },
  { label: 'Tarefa vencida', value: 'tarefa_vencida' },
];

const RECENT_CLIENT_WINDOW_DAYS = 30;

function isRecentClient(client: Client): boolean {
  if (!client.start_date) return false;
  const threshold = new Date();
  threshold.setDate(threshold.getDate() - RECENT_CLIENT_WINDOW_DAYS);
  return new Date(`${client.start_date}T00:00:00`) >= threshold;
}

export function ClientListPage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [aggregates, setAggregates] = useState<Map<string, ClientAggregate>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<ClientFilter>('todos');
  const [search, setSearch] = useState('');

  const role = profile?.roles?.name;

  useEffect(() => {
    if (role !== 'admin' && role !== 'gestor') {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadClients() {
      try {
        setLoading(true);
        setError(null);
        const [clientRows, aggregateMap] = await Promise.all([listClients(), getClientAggregates()]);
        if (active) {
          setClients(clientRows);
          setAggregates(aggregateMap);
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar clientes.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadClients();

    return () => {
      active = false;
    };
  }, [role]);

  const summary = getClientSummary(clients);
  const filteredClients = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return clients.filter((client) => {
      const aggregate = getClientAggregate(aggregates, client.id);
      const matchesFilter =
        activeFilter === 'todos' ||
        (activeFilter === 'saudaveis' && client.health_status === 'saudavel') ||
        (activeFilter === 'atencao' && client.health_status === 'atencao') ||
        (activeFilter === 'criticos' && client.health_status === 'critico') ||
        (activeFilter === 'onboarding' && client.status === 'onboarding') ||
        (activeFilter === 'recentes' && isRecentClient(client)) ||
        (activeFilter === 'sem_atualizacao' && !aggregate.hasRecentUpdate) ||
        (activeFilter === 'sem_reuniao' && !aggregate.hasRecentOrUpcomingMeeting) ||
        (activeFilter === 'tarefa_vencida' && aggregate.overdueTasks > 0);

      if (!matchesFilter) return false;
      if (!normalizedSearch) return true;

      const searchable = [
        client.company_name,
        client.trade_name,
        client.segment,
        client.responsible?.name,
      ].filter(Boolean).join(' ').toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [activeFilter, aggregates, clients, search]);

  if (role !== 'admin' && role !== 'gestor') {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Clientes"
        description={`${summary.total} clientes cadastrados - ${summary.healthy} saudaveis - ${summary.attention} em atencao - ${summary.critical} criticos`}
        action={(
          <Link to="/app/clientes/novo">
            <Button type="button" variant="primary">Novo cliente</Button>
          </Link>
        )}
      />

      {loading && <LoadingState title="Carregando clientes" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <ClientSummaryGrid clients={clients} />

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
            <div className="relative w-full sm:w-80">
              <svg
                className="pointer-events-none absolute inset-y-0 left-3 my-auto h-4 w-4 text-muted-foreground"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="9" cy="9" r="6" />
                <path d="M17 17l-3.6-3.6" strokeLinecap="round" />
              </svg>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar por nome, segmento ou responsavel"
                className="min-h-9 w-full rounded-full border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
              />
            </div>
          </FilterBar>

          {filteredClients.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 min-[1800px]:grid-cols-4">
              {filteredClients.map((client) => (
                <ClientCard key={client.id} client={client} aggregate={getClientAggregate(aggregates, client.id)} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum cliente encontrado"
              description="Ajuste os filtros ou a busca para localizar clientes da carteira."
            />
          )}
        </>
      )}
    </div>
  );
}

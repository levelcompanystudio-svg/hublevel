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
import { listClients } from '../clients.api';
import type { Client } from '../clients.types';
import { ClientCard } from '../components/ClientCard';
import { ClientSummaryGrid, getClientSummary } from '../components/ClientSummaryGrid';

type ClientFilter = 'todos' | 'saudaveis' | 'atencao' | 'onboarding' | 'inativos';

const filters: Array<{ label: string; value: ClientFilter }> = [
  { label: 'Todos', value: 'todos' },
  { label: 'Saudaveis', value: 'saudaveis' },
  { label: 'Atencao', value: 'atencao' },
  { label: 'Onboarding', value: 'onboarding' },
  { label: 'Inativos', value: 'inativos' },
];

export function ClientListPage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
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
        const result = await listClients();
        if (active) setClients(result);
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
      const matchesFilter =
        activeFilter === 'todos' ||
        (activeFilter === 'saudaveis' && client.health_status === 'saudavel') ||
        (activeFilter === 'atencao' && client.health_status === 'atencao') ||
        (activeFilter === 'onboarding' && client.status === 'onboarding') ||
        (activeFilter === 'inativos' && (client.status === 'pausado' || client.status === 'encerrado'));

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
  }, [activeFilter, clients, search]);

  if (role !== 'admin' && role !== 'gestor') {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Clientes"
        description={`${summary.total} clientes cadastrados - ${summary.healthy} saudaveis - ${summary.attention} precisando de atencao`}
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
            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveFilter(filter.value)}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition ${
                    activeFilter === filter.value
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border bg-muted text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome, segmento ou responsavel"
              className="min-h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary sm:w-80"
            />
          </FilterBar>

          {filteredClients.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3 min-[1800px]:grid-cols-4">
              {filteredClients.map((client) => (
                <ClientCard key={client.id} client={client} />
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

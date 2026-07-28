import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { KpiStrip } from '../../../components/layout/KpiStrip';
import { PageHeader } from '../../../components/layout/PageHeader';
import { QuickFilterPill } from '../../../components/layout/QuickFilterPill';
import { Badge } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getOperationalAlerts } from '../alerts.api';
import type { AlertType, OperationalAlert } from '../alerts.types';
import { AlertTable } from '../components/AlertTable';

type FilterValue = 'todos' | AlertType;

const filters: Array<{ label: string; value: FilterValue }> = [
  { label: 'Todos', value: 'todos' },
  { label: 'Sem atualizacao', value: 'cliente_sem_atualizacao' },
  { label: 'Sem reuniao', value: 'cliente_sem_reuniao' },
  { label: 'Tarefas vencidas', value: 'tarefa_vencida' },
  { label: 'Financeiro atrasado', value: 'financeiro_atrasado' },
];

export function AlertListPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterValue>('todos');

  useEffect(() => {
    if (!canAccess || !role) {
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await getOperationalAlerts(role as 'admin' | 'gestor');
        if (active) setAlerts(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar alertas operacionais.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canAccess, role]);

  const filteredAlerts = useMemo(() => {
    if (activeFilter === 'todos') return alerts;
    return alerts.filter((alert) => alert.type === activeFilter);
  }, [activeFilter, alerts]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  const highPriorityCount = alerts.filter((alert) => alert.severity === 'alta').length;
  const clientAlertsCount = alerts.filter(
    (alert) => alert.type === 'cliente_sem_atualizacao' || alert.type === 'cliente_sem_reuniao',
  ).length;
  const financialAlertsCount = alerts.filter((alert) => alert.type === 'financeiro_atrasado').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Riscos"
        title="Alertas operacionais"
        description="Riscos calculados a partir de clientes, tarefas, reunioes e acompanhamento. Sem persistencia: um alerta some assim que a condicao deixa de existir."
      />

      {loading && <LoadingState title="Calculando alertas" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <KpiStrip
            items={[
              { label: 'Total de alertas', value: alerts.length, tone: 'brand' },
              { label: 'Alta prioridade', value: highPriorityCount, tone: highPriorityCount > 0 ? 'warning' : 'neutral' },
              { label: 'Clientes com risco', value: clientAlertsCount, tone: 'neutral' },
              ...(role === 'admin'
                ? [{ label: 'Financeiro atrasado', value: financialAlertsCount, tone: financialAlertsCount > 0 ? 'warning' as const : 'neutral' as const }]
                : []),
            ]}
          />

          <FilterBar label={role === 'admin' ? 'Todos os clientes' : 'Minha carteira'}>
            <div className="flex flex-wrap gap-1.5">
              {filters
                .filter((filter) => role === 'admin' || filter.value !== 'financeiro_atrasado')
                .map((filter) => (
                  <QuickFilterPill
                    key={filter.value}
                    label={filter.label}
                    active={activeFilter === filter.value}
                    onClick={() => setActiveFilter(filter.value)}
                  />
                ))}
            </div>
            <Badge tone="brand">Somente leitura</Badge>
          </FilterBar>

          <AlertTable alerts={filteredAlerts} />
        </>
      )}
    </div>
  );
}

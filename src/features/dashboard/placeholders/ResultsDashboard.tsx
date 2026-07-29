import { Activity, CalendarDays, CheckSquare, ChevronRight, FileText } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Card, SectionHeader } from '../../../components/ui';
import { getOperationalAlerts } from '../../alerts/alerts.api';
import type { OperationalAlert } from '../../alerts/alerts.types';
import { AlertPriorityBadge } from '../../alerts/components/AlertPriorityBadge';
import { useAuth } from '../../auth/useAuth';
import { listClients } from '../../clients/clients.api';
import type { Client, ClientHealthStatus } from '../../clients/clients.types';
import { getRecentPortfolioActivity } from '../dashboard-activity.api';
import type { ActivityItem, ActivityType } from '../dashboard-activity.api';
import { getDashboardOperationalOverview } from '../dashboard.api';
import type { DashboardOperationalOverview } from '../dashboard.api';
import { getPortfolioPerformanceOverview } from '../../performance/performance.api';
import { getDefaultPerformancePeriod } from '../../performance/performance-period';
import type { PerformancePeriodRange } from '../../performance/performance-period';
import type { PerformanceOverview } from '../../performance/performance.types';
import { emptyPerformanceOverview } from '../../performance/performance.types';
import { PerformancePeriodFilter } from '../../performance/components/PerformancePeriodFilter';
import { PerformanceSummaryGrid } from '../../performance/components/PerformanceSummaryGrid';
import { PerformanceTrendChart } from '../../performance/components/PerformanceTrendChart';
import { DashboardKpiStrip } from '../components/DashboardKpiStrip';
import { PortfolioHealthMeter } from '../components/PortfolioHealthMeter';

const HEALTH_GROUPS: Array<{ status: ClientHealthStatus; label: string; barClassName: string; dotClassName: string }> = [
  { status: 'saudavel', label: 'Saudaveis', barClassName: 'bg-success', dotClassName: 'bg-success' },
  { status: 'atencao', label: 'Atencao', barClassName: 'bg-warning', dotClassName: 'bg-warning' },
  { status: 'critico', label: 'Criticos', barClassName: 'bg-destructive', dotClassName: 'bg-destructive' },
];

const ACTIVITY_ICONS: Record<ActivityType, typeof CheckSquare> = {
  tarefa: CheckSquare,
  atualizacao: Activity,
  reuniao: CalendarDays,
  documento: FileText,
};

function formatRelativeDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

// Cockpit operacional (admin/gestor) para /app/dashboard. Nenhum dado financeiro aqui - isso fica
// exclusivo do Painel Administrativo (/app/painel-administrativo). Todas as secoes usam dados reais
// ja existentes no banco (clientes, alertas operacionais, tarefas, reunioes, atividade recente);
// Performance so mostra numeros quando uma integracao real existir - sem grade de "Sem dados".
export function ResultsDashboard() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;

  const [overview, setOverview] = useState<DashboardOperationalOverview | null>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [alerts, setAlerts] = useState<OperationalAlert[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [period, setPeriod] = useState<PerformancePeriodRange>(getDefaultPerformancePeriod());
  const [performance, setPerformance] = useState<PerformanceOverview>(emptyPerformanceOverview);
  const [performanceLoading, setPerformanceLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (role !== 'admin' && role !== 'gestor') return;

    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [overviewResult, clientsResult, alertsResult, activityResult] = await Promise.all([
          getDashboardOperationalOverview(),
          listClients(),
          getOperationalAlerts(role as 'admin' | 'gestor'),
          getRecentPortfolioActivity(),
        ]);
        if (!active) return;
        setOverview(overviewResult);
        setClients(clientsResult);
        setAlerts(alertsResult);
        setActivity(activityResult);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar o dashboard.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [role]);

  useEffect(() => {
    if (role !== 'admin' && role !== 'gestor') return;

    let active = true;
    setPerformanceLoading(true);
    getPortfolioPerformanceOverview(period)
      .then((result) => {
        if (active) setPerformance(result);
      })
      .finally(() => {
        if (active) setPerformanceLoading(false);
      });
    return () => {
      active = false;
    };
  }, [role, period]);

  if (loading) return <LoadingState title="Carregando dashboard" />;
  if (error) return <ErrorState description={error} />;
  if (!overview) return null;

  const clientsNeedingAttention = new Set(alerts.filter((alert) => alert.clientId).map((alert) => alert.clientId)).size;
  const topAlerts = alerts.slice(0, 5);
  const operationalClients = clients.filter((client) => client.status === 'ativo' || client.status === 'onboarding');
  const totalClientsForHealth = operationalClients.length;
  const healthGroups = HEALTH_GROUPS.map((group) => ({
    key: group.status,
    label: group.label,
    count: operationalClients.filter((client) => client.health_status === group.status).length,
    barClassName: group.barClassName,
    dotClassName: group.dotClassName,
  }));

  return (
    <div className="space-y-6">
      <DashboardKpiStrip
        items={[
          {
            label: 'Clientes ativos',
            value: overview.activeClients,
            description: `${operationalClients.length} operacionais incluindo onboarding`,
            tone: 'brand',
          },
          {
            label: 'Precisam de atencao',
            value: clientsNeedingAttention,
            tone: clientsNeedingAttention > 0 ? 'warning' : 'neutral',
          },
          { label: 'Tarefas pendentes', value: overview.openTasks, tone: 'neutral' },
          { label: 'Reunioes proximas (7d)', value: overview.meetingsNext7Days, tone: 'neutral' },
        ]}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <SectionHeader
            title="Atencao necessaria"
            caption={`${clientsNeedingAttention} clientes com pendencias identificadas`}
            action={
              <Link to="/app/alertas" className="text-xs font-semibold text-primary hover:underline">
                Ver todos
              </Link>
            }
          />
          <div className="mt-3">
            {topAlerts.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Nenhum alerta no momento.</p>
            ) : (
              <div className="divide-y divide-border">
                {topAlerts.map((alert) => (
                  <Link
                    key={alert.id}
                    to={alert.clientId ? `/app/clientes/${alert.clientId}` : '/app/alertas'}
                    className="flex items-center justify-between gap-3 py-2.5 transition-colors duration-150 hover:bg-card-elevated"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-foreground">{alert.clientName ?? alert.title}</p>
                      <p className="truncate text-xs text-muted-foreground">{alert.description}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1.5">
                      <AlertPriorityBadge severity={alert.severity} />
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card>
          <SectionHeader title="Saude da carteira" caption="Distribuicao dos clientes por status de saude" />
          <div className="mt-5">
            <PortfolioHealthMeter groups={healthGroups} total={totalClientsForHealth} />
          </div>
        </Card>
      </div>

      <Card className="border-t-2 border-t-primary/50">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <h3 className="text-h2 text-foreground">Performance</h3>
            <p className="text-caption mt-1">Investimento, impressoes, cliques, leads, CPL e ROAS de todos os clientes conectados</p>
          </div>
          <Link to="/app/performance" className="text-xs font-semibold text-primary hover:underline">
            Ver detalhes
          </Link>
        </div>
        <div className="mt-4">
          <PerformancePeriodFilter value={period} onChange={setPeriod} />
        </div>
        {performanceLoading ? (
          <p className="mt-4 py-6 text-center text-sm text-muted-foreground">Carregando performance...</p>
        ) : !performance.hasData ? (
          <div className="mt-4 flex flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border bg-surface/40 py-8 text-center">
            <p className="text-sm font-semibold text-foreground">Nenhuma métrica sincronizada ainda.</p>
            <p className="max-w-xs text-xs text-muted-foreground">
              Conecte Meta Ads em um cliente (aba Integracoes) para ver investimento, leads e ROAS aqui.
            </p>
          </div>
        ) : (
          <div className="mt-5 space-y-5">
            <PerformanceSummaryGrid overview={performance} variant="dashboard" />
            <PerformanceTrendChart data={performance.dailySeries} />
          </div>
        )}
      </Card>

      <Card>
        <SectionHeader title="Atividade recente" />
        <div className="mt-2">
          {activity.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Nenhuma atividade registrada ainda.</p>
          ) : (
            <div className="divide-y divide-border">
              {activity.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type];
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex items-start gap-2.5 py-2 transition-colors duration-150 hover:bg-card-elevated"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-foreground">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {item.clientName ?? 'Interno'} - {formatRelativeDate(item.createdAt)}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

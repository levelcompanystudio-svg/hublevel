import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { getOperationalAlerts } from '../../alerts/alerts.api';
import type { OperationalAlert } from '../../alerts/alerts.types';
import { useAuth } from '../../auth/useAuth';
import { listClients } from '../../clients/clients.api';
import type { Client, ClientHealthStatus } from '../../clients/clients.types';
import { getRecentPortfolioActivity } from '../dashboard-activity.api';
import type { ActivityItem } from '../dashboard-activity.api';
import { getDashboardOperationalOverview } from '../dashboard.api';
import type { DashboardOperationalOverview } from '../dashboard.api';
import { getPortfolioPerformanceOverview } from '../../performance/performance.api';
import { getDefaultPerformancePeriod } from '../../performance/performance-period';
import type { PerformancePeriodRange } from '../../performance/performance-period';
import type { PerformanceOverview } from '../../performance/performance.types';
import { emptyPerformanceOverview } from '../../performance/performance.types';
import { ActivityStream } from '../components/ActivityStream';
import { DashboardCommandHeader } from '../components/DashboardCommandHeader';
import { OperationalRail } from '../components/OperationalRail';
import { PerformanceCommandPanel } from '../components/PerformanceCommandPanel';
import { PortfolioPulse } from '../components/PortfolioPulse';

const HEALTH_GROUPS: Array<{ status: ClientHealthStatus; label: string; barClassName: string; dotClassName: string; textClassName: string }> = [
  { status: 'saudavel', label: 'Saudaveis', barClassName: 'bg-success', dotClassName: 'bg-success', textClassName: 'text-success' },
  { status: 'atencao', label: 'Atencao', barClassName: 'bg-warning', dotClassName: 'bg-warning', textClassName: 'text-warning' },
  { status: 'critico', label: 'Criticos', barClassName: 'bg-destructive', dotClassName: 'bg-destructive', textClassName: 'text-destructive' },
];

// Cockpit operacional (admin/gestor) para /app/dashboard - Dashboard V3 "manifesto": composicao
// assimetrica (painel de performance dominante + rail operacional) em vez de uma coluna unica de
// cards empilhados. Nenhum dado financeiro aqui - isso fica exclusivo do Painel Administrativo
// (/app/painel-administrativo). Todas as secoes usam dados reais ja existentes no banco (clientes,
// alertas operacionais, tarefas, reunioes, atividade recente); Performance so mostra numeros
// quando uma integracao real existir - sem grade de "Sem dados".
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
  const operationalClients = clients.filter((client) => client.status === 'ativo' || client.status === 'onboarding');
  const totalClientsForHealth = operationalClients.length;
  const healthGroups = HEALTH_GROUPS.map((group) => ({
    key: group.status,
    label: group.label,
    count: operationalClients.filter((client) => client.health_status === group.status).length,
    barClassName: group.barClassName,
    dotClassName: group.dotClassName,
    textClassName: group.textClassName,
  }));
  const healthySaudavel = healthGroups.find((group) => group.key === 'saudavel');
  const healthyPercent = totalClientsForHealth > 0 && healthySaudavel
    ? Math.round((healthySaudavel.count / totalClientsForHealth) * 100)
    : null;

  return (
    <div className="space-y-6">
      <DashboardCommandHeader
        userName={profile?.name}
        activeClients={overview.activeClients}
        openTasks={overview.openTasks}
        healthyPercent={healthyPercent}
        clientsNeedingAttention={clientsNeedingAttention}
      />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <PerformanceCommandPanel overview={performance} loading={performanceLoading} period={period} onPeriodChange={setPeriod} />
        <OperationalRail alerts={alerts} meetingsNext7Days={overview.meetingsNext7Days} openTasks={overview.openTasks} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px_minmax(0,1fr)]">
        <PortfolioPulse groups={healthGroups} total={totalClientsForHealth} />
        <ActivityStream items={activity} />
      </div>
    </div>
  );
}

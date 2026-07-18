import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Tabs } from '../../../components/ui';
import type { RoleName } from '../../auth/auth.types';
import type { ClientOverviewData, ClientOverviewMetrics } from '../client-overview.types';
import type { Client } from '../clients.types';
import { ClientChecklistTab } from './ClientChecklistTab';
import { ClientContractsTab } from './ClientContractsTab';
import { ClientDeliverablesTab } from './ClientDeliverablesTab';
import { ClientDocumentsTab } from './ClientDocumentsTab';
import { ClientFinanceTab } from './ClientFinanceTab';
import { ClientHistoryTab } from './ClientHistoryTab';
import { ClientIntegrationsTab } from './ClientIntegrationsTab';
import { ClientLandingPageTab } from './ClientLandingPageTab';
import { ClientMeetingsTab } from './ClientMeetingsTab';
import { ClientMetricsTab } from './ClientMetricsTab';
import { ClientOperationSummary } from './ClientOperationSummary';
import { ClientOverviewSummary } from './ClientOverviewSummary';
import { ClientServicesTab } from './ClientServicesTab';
import { ClientTasksTab } from './ClientTasksTab';
import { ClientUpdatesTab } from './ClientUpdatesTab';

interface ClientOverviewTabsProps {
  client: Client;
  role?: RoleName;
  overview: ClientOverviewData | null;
  metrics: ClientOverviewMetrics | null;
  overviewLoading: boolean;
  overviewError: string | null;
}

const allTabs = [
  'Visao geral',
  'Operacao',
  'Servicos',
  'Tarefas',
  'Acompanhamento',
  'Reunioes',
  'Entregaveis',
  'Documentos',
  'Checklist',
  'Metricas',
  'Integracoes',
  'Landing Page',
  'Financeiro',
  'Contratos',
  'Historico',
] as const;

type TabName = (typeof allTabs)[number];

const ADMIN_ONLY_TABS: TabName[] = ['Financeiro', 'Contratos'];

export function ClientOverviewTabs({ client, role, overview, metrics, overviewLoading, overviewError }: ClientOverviewTabsProps) {
  const visibleTabs = useMemo(
    () => allTabs.filter((tab) => !ADMIN_ONLY_TABS.includes(tab) || role === 'admin'),
    [role],
  );

  const [activeTab, setActiveTab] = useState<TabName>('Visao geral');

  useEffect(() => {
    setActiveTab('Visao geral');
  }, [client.id]);

  return (
    <div className="space-y-4">
      <Tabs
        ariaLabel="Abas do cliente"
        tabs={visibleTabs.map((tab) => ({ key: tab, label: tab }))}
        activeKey={activeTab}
        onChange={(key) => setActiveTab(key as TabName)}
      />

      {activeTab === 'Visao geral' ? (
        overviewLoading ? (
          <LoadingState title="Carregando resumo operacional" />
        ) : overviewError ? (
          <ErrorState description={overviewError} />
        ) : overview && metrics ? (
          <ClientOverviewSummary data={overview} metrics={metrics} />
        ) : null
      ) : activeTab === 'Operacao' ? (
        <ClientOperationSummary client={client} />
      ) : activeTab === 'Servicos' ? (
        <ClientServicesTab clientId={client.id} canManage={role === 'admin'} />
      ) : activeTab === 'Tarefas' ? (
        <ClientTasksTab clientId={client.id} canManage={role === 'admin' || role === 'gestor'} />
      ) : activeTab === 'Acompanhamento' ? (
        <ClientUpdatesTab clientId={client.id} canManage={role === 'admin' || role === 'gestor'} />
      ) : activeTab === 'Reunioes' ? (
        <ClientMeetingsTab clientId={client.id} canManage={role === 'admin' || role === 'gestor'} />
      ) : activeTab === 'Entregaveis' ? (
        <ClientDeliverablesTab clientId={client.id} canManage={role === 'admin' || role === 'gestor'} />
      ) : activeTab === 'Documentos' ? (
        <ClientDocumentsTab
          clientId={client.id}
          canCreate={role === 'admin' || role === 'gestor'}
          canEdit={role === 'admin'}
        />
      ) : activeTab === 'Checklist' ? (
        <ClientChecklistTab clientId={client.id} />
      ) : activeTab === 'Metricas' ? (
        <ClientMetricsTab clientId={client.id} />
      ) : activeTab === 'Integracoes' ? (
        <ClientIntegrationsTab clientId={client.id} />
      ) : activeTab === 'Landing Page' ? (
        <ClientLandingPageTab client={client} canManage={role === 'admin' || role === 'gestor'} />
      ) : activeTab === 'Financeiro' && role === 'admin' ? (
        <ClientFinanceTab clientId={client.id} />
      ) : activeTab === 'Contratos' && role === 'admin' ? (
        <ClientContractsTab clientId={client.id} />
      ) : activeTab === 'Historico' ? (
        <ClientHistoryTab clientId={client.id} />
      ) : (
        <EmptyState
          title={`${activeTab} em desenvolvimento`}
          description="Esta area ja esta posicionada no painel do cliente e sera conectada na etapa correspondente."
        />
      )}
    </div>
  );
}

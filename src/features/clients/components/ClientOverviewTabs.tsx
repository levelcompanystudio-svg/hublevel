import { useEffect, useMemo, useState } from 'react';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import type { RoleName } from '../../auth/auth.types';
import type { ClientOverviewData, ClientOverviewMetrics } from '../client-overview.types';
import type { Client } from '../clients.types';
import { ClientChecklistTab } from './ClientChecklistTab';
import { ClientContractsTab } from './ClientContractsTab';
import { ClientDeliverablesTab } from './ClientDeliverablesTab';
import { ClientDocumentsTab } from './ClientDocumentsTab';
import { ClientFinanceTab } from './ClientFinanceTab';
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
      <div className="overflow-x-auto rounded-lg border border-border bg-card p-2">
        <div className="flex min-w-max gap-2" role="tablist" aria-label="Abas do cliente">
          {visibleTabs.map((tab) => (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={activeTab === tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-md px-3 py-2 text-sm font-semibold transition ${
                activeTab === tab
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

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
        <ClientDeliverablesTab clientId={client.id} />
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
      ) : activeTab === 'Financeiro' && role === 'admin' ? (
        <ClientFinanceTab clientId={client.id} />
      ) : activeTab === 'Contratos' && role === 'admin' ? (
        <ClientContractsTab clientId={client.id} />
      ) : (
        <EmptyState
          title={`${activeTab} em desenvolvimento`}
          description="Esta area ja esta posicionada no painel do cliente e sera conectada na etapa correspondente."
        />
      )}
    </div>
  );
}

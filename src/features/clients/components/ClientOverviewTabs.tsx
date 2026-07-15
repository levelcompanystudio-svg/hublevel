import { useEffect, useState } from 'react';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card } from '../../../components/ui';
import type { RoleName } from '../../auth/auth.types';
import type { Client } from '../clients.types';
import { ClientChecklistTab } from './ClientChecklistTab';
import { ClientDocumentsTab } from './ClientDocumentsTab';
import { ClientHealthBadge } from './ClientHealthBadge';
import { ClientMeetingsTab } from './ClientMeetingsTab';
import { ClientServicesTab } from './ClientServicesTab';
import { ClientStatusBadge } from './ClientStatusBadge';
import { ClientTasksTab } from './ClientTasksTab';
import { ClientUpdatesTab } from './ClientUpdatesTab';

interface ClientOverviewTabsProps {
  client: Client;
  role?: RoleName;
}

const tabs = [
  'Visao geral',
  'Servicos',
  'Financeiro',
  'Tarefas',
  'Acompanhamento',
  'Reunioes',
  'Documentos',
  'Checklist',
  'Historico',
] as const;

type TabName = typeof tabs[number];

function formatDate(value: string | null) {
  if (!value) return '-';
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

export function ClientOverviewTabs({ client, role }: ClientOverviewTabsProps) {
  const [activeTab, setActiveTab] = useState<TabName>('Visao geral');

  useEffect(() => {
    setActiveTab('Visao geral');
  }, [client.id]);

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg border border-border bg-card p-2">
        <div className="flex min-w-max gap-2" role="tablist" aria-label="Abas do cliente">
          {tabs.map((tab) => (
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
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <h3 className="text-base font-semibold text-foreground">Dados da empresa</h3>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <InfoItem label="Razao social" value={client.company_name} />
              <InfoItem label="Nome fantasia" value={client.trade_name ?? '-'} />
              <InfoItem label="Documento" value={client.document_number ?? '-'} />
              <InfoItem label="Segmento" value={client.segment ?? '-'} />
              <InfoItem label="Responsavel" value={client.responsible?.name ?? '-'} />
              <InfoItem label="Inicio" value={formatDate(client.start_date)} />
            </div>
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-foreground">Operacao</h3>
            <div className="mt-5 space-y-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Status</p>
                <ClientStatusBadge status={client.status} />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Saude</p>
                <ClientHealthBadge status={client.health_status} />
              </div>
              <InfoItem label="Fim da parceria" value={formatDate(client.end_date)} />
            </div>
          </Card>

          <Card className="xl:col-span-2">
            <h3 className="text-base font-semibold text-foreground">Observacoes</h3>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {client.notes ?? 'Nenhuma observacao cadastrada para este cliente.'}
            </p>
          </Card>
        </div>
      ) : activeTab === 'Servicos' ? (
        <ClientServicesTab clientId={client.id} canManage={role === 'admin'} />
      ) : activeTab === 'Tarefas' ? (
        <ClientTasksTab clientId={client.id} canManage={role === 'admin' || role === 'gestor'} />
      ) : activeTab === 'Acompanhamento' ? (
        <ClientUpdatesTab clientId={client.id} canManage={role === 'admin' || role === 'gestor'} />
      ) : activeTab === 'Reunioes' ? (
        <ClientMeetingsTab clientId={client.id} canManage={role === 'admin' || role === 'gestor'} />
      ) : activeTab === 'Documentos' ? (
        <ClientDocumentsTab
          clientId={client.id}
          canCreate={role === 'admin' || role === 'gestor'}
          canEdit={role === 'admin'}
        />
      ) : activeTab === 'Checklist' ? (
        <ClientChecklistTab clientId={client.id} />
      ) : (
        <EmptyState
          title={`${activeTab} em desenvolvimento`}
          description="Esta area ja esta posicionada no painel do cliente e sera conectada na etapa correspondente."
        />
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

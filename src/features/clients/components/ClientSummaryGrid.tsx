import { SummaryCard } from '../../../components/layout/SummaryCard';
import type { Client } from '../clients.types';

interface ClientSummaryGridProps {
  clients: Client[];
}

export function getClientSummary(clients: Client[]) {
  return {
    total: clients.length,
    healthy: clients.filter((client) => client.health_status === 'saudavel').length,
    attention: clients.filter((client) => client.health_status === 'atencao').length,
    critical: clients.filter((client) => client.health_status === 'critico').length,
    onboarding: clients.filter((client) => client.status === 'onboarding').length,
    inactive: clients.filter((client) => client.status === 'pausado' || client.status === 'encerrado').length,
  };
}

export function ClientSummaryGrid({ clients }: ClientSummaryGridProps) {
  const summary = getClientSummary(clients);

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <SummaryCard label="Total de clientes" value={summary.total} tone="brand" />
      <SummaryCard label="Saudaveis" value={summary.healthy} tone="success" />
      <SummaryCard label="Atencao" value={summary.attention} tone="warning" />
      <SummaryCard label="Criticos" value={summary.critical} tone="warning" />
      <SummaryCard label="Onboarding" value={summary.onboarding} />
      <SummaryCard label="Inativos" value={summary.inactive} />
    </div>
  );
}

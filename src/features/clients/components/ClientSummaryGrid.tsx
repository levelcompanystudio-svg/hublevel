import type { Client } from '../clients.types';
import { ClientKpiStrip } from './ClientKpiStrip';

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
    <ClientKpiStrip
      items={[
        { label: 'Total de clientes', value: summary.total, tone: 'brand' },
        { label: 'Saudaveis', value: summary.healthy, tone: 'success' },
        { label: 'Atencao', value: summary.attention, tone: 'warning' },
        { label: 'Criticos', value: summary.critical, tone: summary.critical > 0 ? 'destructive' : 'neutral' },
        { label: 'Onboarding', value: summary.onboarding, tone: 'neutral' },
        { label: 'Inativos', value: summary.inactive, tone: 'neutral' },
      ]}
    />
  );
}

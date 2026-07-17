import { SummaryCard } from '../../../components/layout/SummaryCard';
import type { ClientIntegration } from '../integrations.types';

interface IntegrationSummaryProps {
  integrations: ClientIntegration[];
}

export function IntegrationSummary({ integrations }: IntegrationSummaryProps) {
  const metaConnected = integrations.filter((item) => item.provider === 'meta_ads' && item.status === 'connected').length;
  const googleConnected = integrations.filter((item) => item.provider === 'google_ads' && item.status === 'connected').length;
  const withError = integrations.filter((item) => item.status === 'error').length;
  const neverSynced = integrations.filter((item) => !item.last_sync_at).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard label="Clientes com Meta Ads conectado" value={metaConnected} tone="brand" />
      <SummaryCard label="Clientes com Google Ads conectado" value={googleConnected} tone="brand" />
      <SummaryCard label="Integracoes com erro" value={withError} tone={withError > 0 ? 'warning' : 'neutral'} />
      <SummaryCard label="Nunca sincronizadas" value={neverSynced} />
    </div>
  );
}

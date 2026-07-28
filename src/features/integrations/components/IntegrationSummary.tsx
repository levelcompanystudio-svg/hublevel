import { KpiStrip } from '../../../components/layout/KpiStrip';
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
    <KpiStrip
      items={[
        { label: 'Meta Ads conectado', value: metaConnected, tone: 'brand' },
        { label: 'Google Ads conectado', value: googleConnected, tone: 'brand' },
        { label: 'Integracoes com erro', value: withError, tone: withError > 0 ? 'destructive' : 'neutral' },
        { label: 'Nunca sincronizadas', value: neverSynced, tone: 'neutral' },
      ]}
    />
  );
}

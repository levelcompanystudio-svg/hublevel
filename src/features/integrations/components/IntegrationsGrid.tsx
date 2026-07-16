import type { IntegrationInfo } from '../integrations.types';
import { IntegrationCard } from './IntegrationCard';

interface IntegrationsGridProps {
  integrations: IntegrationInfo[];
}

export function IntegrationsGrid({ integrations }: IntegrationsGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {integrations.map((integration) => (
        <IntegrationCard key={integration.provider} integration={integration} />
      ))}
    </div>
  );
}

import { Badge } from '../../../components/ui';
import { landingPageLeadStatusLabels } from '../landing-page-leads.types';
import type { LandingPageLeadStatus } from '../landing-page-leads.types';

const STATUS_TONE: Record<LandingPageLeadStatus, 'neutral' | 'brand' | 'success' | 'warning' | 'destructive'> = {
  novo: 'warning',
  contatado: 'brand',
  qualificado: 'success',
  descartado: 'neutral',
};

export function LandingPageLeadStatusBadge({ status }: { status: LandingPageLeadStatus }) {
  return <Badge tone={STATUS_TONE[status]}>{landingPageLeadStatusLabels[status]}</Badge>;
}

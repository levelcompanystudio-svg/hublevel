import { Badge } from '../../../components/ui';
import type { CrmOpportunityStatus } from '../crm.types';

const STATUS_CONFIG: Record<CrmOpportunityStatus, { label: string; tone: 'neutral' | 'brand' | 'success' | 'warning' | 'destructive' }> = {
  open: { label: 'Aberta', tone: 'brand' },
  won: { label: 'Ganha', tone: 'success' },
  lost: { label: 'Perdida', tone: 'destructive' },
  archived: { label: 'Arquivada', tone: 'neutral' },
};

// Fonte unica de labels/ordem para o badge e para o seletor rapido de status em
// CrmOpportunityList - evita rotulo duplicado/divergente entre os dois lugares.
export const CRM_OPPORTUNITY_STATUS_OPTIONS: Array<{ value: CrmOpportunityStatus; label: string }> = (
  Object.keys(STATUS_CONFIG) as CrmOpportunityStatus[]
).map((status) => ({ value: status, label: STATUS_CONFIG[status].label }));

export function CrmOpportunityStatusBadge({ status }: { status: CrmOpportunityStatus }) {
  const config = STATUS_CONFIG[status];
  return <Badge tone={config.tone}>{config.label}</Badge>;
}

import type { CrmOpportunity, CrmOpportunityStatus } from '../crm.types';
import { CRM_OPPORTUNITY_STATUS_OPTIONS, CrmOpportunityStatusBadge } from './CrmOpportunityStatusBadge';

interface CrmOpportunityListProps {
  opportunities: CrmOpportunity[];
  canManage: boolean;
  onEdit: (opportunity: CrmOpportunity) => void;
  onStatusChange: (opportunityId: string, status: CrmOpportunityStatus) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Lista de oportunidades dentro de uma etapa - sem drag and drop. A troca de status e o "botao
// rapido" pedido (select que aplica na hora); edicao completa abre o CrmOpportunityForm.
export function CrmOpportunityList({ opportunities, canManage, onEdit, onStatusChange }: CrmOpportunityListProps) {
  if (opportunities.length === 0) {
    return <p className="px-3 py-4 text-center text-xs text-muted-foreground">Nenhuma oportunidade nesta etapa.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {opportunities.map((opportunity) => (
        <li key={opportunity.id} className="rounded-lg border border-border bg-surface p-2.5">
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-medium text-foreground">{opportunity.title}</p>
            <CrmOpportunityStatusBadge status={opportunity.status} />
          </div>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate text-xs text-muted-foreground">{opportunity.contact?.name ?? 'Sem contato'}</p>
            {opportunity.value !== null && (
              <p className="shrink-0 font-mono text-xs font-semibold tabular-nums text-foreground">{formatCurrency(opportunity.value)}</p>
            )}
          </div>
          {canManage && (
            <div className="mt-2 flex items-center gap-2 border-t border-border/70 pt-2">
              <select
                value={opportunity.status}
                onChange={(event) => onStatusChange(opportunity.id, event.target.value as CrmOpportunityStatus)}
                className="flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                aria-label={`Status de ${opportunity.title}`}
              >
                {CRM_OPPORTUNITY_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => onEdit(opportunity)}
                className="shrink-0 text-xs font-semibold text-primary hover:underline"
              >
                Editar
              </button>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}

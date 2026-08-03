import { CalendarClock, User } from 'lucide-react';
import type { CrmOpportunity, CrmOpportunityStatus, CrmPipelineStage } from '../crm.types';
import { CRM_OPPORTUNITY_STATUS_OPTIONS, CrmOpportunityStatusBadge } from './CrmOpportunityStatusBadge';

interface CrmOpportunityListProps {
  opportunities: CrmOpportunity[];
  stages: CrmPipelineStage[];
  canManage: boolean;
  onEdit: (opportunity: CrmOpportunity) => void;
  onStatusChange: (opportunityId: string, status: CrmOpportunityStatus) => void;
  onMoveStage: (opportunityId: string, stageId: string) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

// Lista de oportunidades dentro de uma etapa - sem drag and drop. Mover de etapa e trocar status
// sao os "botoes rapidos" pedidos (select que aplica na hora); edicao completa abre
// CrmOpportunityForm. Contato/valor/previsao ja vinham da query (crm.api.ts) - Etapa 10 so passou
// a exibir expected_close_date, que ja era buscado e ficava sem uso na tela.
export function CrmOpportunityList({ opportunities, stages, canManage, onEdit, onStatusChange, onMoveStage }: CrmOpportunityListProps) {
  if (opportunities.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/70 px-3 py-4 text-center">
        <p className="text-xs text-muted-foreground">Nenhuma oportunidade nesta etapa.</p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {opportunities.map((opportunity) => (
        <li
          key={opportunity.id}
          className="rounded-lg border border-border bg-surface p-3 shadow-soft-sm transition-colors duration-150 hover:border-primary/30"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="min-w-0 truncate text-sm font-medium text-foreground">{opportunity.title}</p>
            <CrmOpportunityStatusBadge status={opportunity.status} />
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
              <User className="h-3 w-3 shrink-0" aria-hidden="true" />
              <span className="truncate">{opportunity.contact?.name ?? 'Sem contato'}</span>
            </span>
            {opportunity.expected_close_date && (
              <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                <CalendarClock className="h-3 w-3 shrink-0" aria-hidden="true" />
                {formatDate(opportunity.expected_close_date)}
              </span>
            )}
            {opportunity.value !== null && (
              <span className="ml-auto shrink-0 font-mono text-xs font-semibold tabular-nums text-foreground">
                {formatCurrency(opportunity.value)}
              </span>
            )}
          </div>

          {canManage && (
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5 border-t border-border/70 pt-2.5">
              <select
                value={opportunity.stage_id}
                onChange={(event) => onMoveStage(opportunity.id, event.target.value)}
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
                aria-label={`Etapa de ${opportunity.title}`}
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
              <select
                value={opportunity.status}
                onChange={(event) => onStatusChange(opportunity.id, event.target.value as CrmOpportunityStatus)}
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary"
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

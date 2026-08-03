import { Badge, Card } from '../../../components/ui';
import type { CrmOpportunity, CrmOpportunityStatus, CrmPipelineStage } from '../crm.types';
import { CrmOpportunityList } from './CrmOpportunityList';

interface CrmPipelineOverviewProps {
  stages: CrmPipelineStage[];
  opportunities: CrmOpportunity[];
  canManage: boolean;
  onEditOpportunity: (opportunity: CrmOpportunity) => void;
  onStatusChange: (opportunityId: string, status: CrmOpportunityStatus) => void;
  onMoveStage: (opportunityId: string, stageId: string) => void;
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Kanban simples: etapas lado a lado (colunas), oportunidades agrupadas dentro de cada uma, com
// total de quantidade e valor por etapa. Mover de etapa e trocar status usam select por card (ver
// CrmOpportunityList) - sem drag and drop, conforme decidido para nao arriscar a entrega. Scroll
// horizontal em telas estreitas, igual ao padrao ja usado em Tabs/tabelas do produto.
export function CrmPipelineOverview({ stages, opportunities, canManage, onEditOpportunity, onStatusChange, onMoveStage }: CrmPipelineOverviewProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {stages.map((stage) => {
        const stageOpportunities = opportunities.filter((opportunity) => opportunity.stage_id === stage.id);
        const stageTotal = stageOpportunities.reduce((sum, opportunity) => sum + (opportunity.value ?? 0), 0);

        return (
          <Card key={stage.id} className="w-64 shrink-0 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-h3 truncate text-foreground">{stage.name}</p>
              {stage.probability !== null && <Badge tone="neutral">{stage.probability}%</Badge>}
            </div>
            <div className="mt-0.5 flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">
                {stageOpportunities.length} {stageOpportunities.length === 1 ? 'oportunidade' : 'oportunidades'}
              </p>
              {stageTotal > 0 && (
                <p className="font-mono text-xs font-semibold tabular-nums text-foreground">{formatCurrency(stageTotal)}</p>
              )}
            </div>
            <div className="mt-3">
              <CrmOpportunityList
                opportunities={stageOpportunities}
                stages={stages}
                canManage={canManage}
                onEdit={onEditOpportunity}
                onStatusChange={onStatusChange}
                onMoveStage={onMoveStage}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

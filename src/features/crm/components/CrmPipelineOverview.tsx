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
// horizontal em telas estreitas, igual ao padrao ja usado em Tabs/tabelas do produto. O wrapper
// com fundo proprio (Etapa 10) so reforca visualmente que isso e um board, sem mudar a estrutura
// de dados/colunas.
export function CrmPipelineOverview({ stages, opportunities, canManage, onEditOpportunity, onStatusChange, onMoveStage }: CrmPipelineOverviewProps) {
  return (
    <div className="rounded-xl border border-border/60 bg-surface/30 p-3">
      <div className="flex snap-x gap-3 overflow-x-auto pb-1">
        {stages.map((stage) => {
          const stageOpportunities = opportunities.filter((opportunity) => opportunity.stage_id === stage.id);
          const stageTotal = stageOpportunities.reduce((sum, opportunity) => sum + (opportunity.value ?? 0), 0);

          return (
            <Card key={stage.id} className="w-72 shrink-0 snap-start overflow-hidden p-0">
              <div className="border-b border-border bg-card-elevated/60 px-3 py-2.5">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-h3 truncate text-foreground">{stage.name}</p>
                  {stage.probability !== null && <Badge tone="neutral">{stage.probability}%</Badge>}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {stageOpportunities.length} {stageOpportunities.length === 1 ? 'oportunidade' : 'oportunidades'}
                  </p>
                  {stageTotal > 0 && (
                    <p className="font-mono text-xs font-semibold tabular-nums text-foreground">{formatCurrency(stageTotal)}</p>
                  )}
                </div>
              </div>
              <div className="max-h-[28rem] overflow-y-auto p-2.5">
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
    </div>
  );
}

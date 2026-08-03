import { Badge, Card } from '../../../components/ui';
import type { CrmOpportunity, CrmPipelineStage } from '../crm.types';
import { CrmOpportunityList } from './CrmOpportunityList';

interface CrmPipelineOverviewProps {
  stages: CrmPipelineStage[];
  opportunities: CrmOpportunity[];
}

// Etapas lado a lado com as oportunidades agrupadas dentro de cada uma - layout simples (nao e
// um Kanban: sem drag and drop, sem mover cartao). Scroll horizontal em telas estreitas, igual ao
// padrao ja usado em Tabs/tabelas do produto.
export function CrmPipelineOverview({ stages, opportunities }: CrmPipelineOverviewProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {stages.map((stage) => {
        const stageOpportunities = opportunities.filter((opportunity) => opportunity.stage_id === stage.id);
        return (
          <Card key={stage.id} className="w-64 shrink-0 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-h3 truncate text-foreground">{stage.name}</p>
              {stage.probability !== null && <Badge tone="neutral">{stage.probability}%</Badge>}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {stageOpportunities.length} {stageOpportunities.length === 1 ? 'oportunidade' : 'oportunidades'}
            </p>
            <div className="mt-3">
              <CrmOpportunityList opportunities={stageOpportunities} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

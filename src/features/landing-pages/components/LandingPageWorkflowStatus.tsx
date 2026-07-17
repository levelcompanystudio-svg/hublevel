import { Check, Clock, Lock } from 'lucide-react';
import { Card } from '../../../components/ui';

interface LandingPageWorkflowStatusProps {
  briefingSaved: boolean;
  briefingAttached: boolean;
  analysisDone: boolean;
  contentGenerated: boolean;
  previewAvailable: boolean;
}

interface StepDefinition {
  key: string;
  label: string;
  done: boolean;
}

// Progresso puramente visual, derivado do state ja existente na aba (nao introduz nenhuma query
// nova nem persiste nada). "Publicacao" nunca fica "concluida" nesta etapa de proposito - e so um
// marcador de que esse passo ainda e futuro.
export function LandingPageWorkflowStatus({
  briefingSaved,
  briefingAttached,
  analysisDone,
  contentGenerated,
  previewAvailable,
}: LandingPageWorkflowStatusProps) {
  const steps: StepDefinition[] = [
    { key: 'briefing', label: 'Briefing salvo', done: briefingSaved },
    { key: 'attachment', label: 'Briefing anexado', done: briefingAttached },
    { key: 'analysis', label: 'Analise IA realizada', done: analysisDone },
    { key: 'content', label: 'Conteudo gerado', done: contentGenerated },
    { key: 'preview', label: 'Preview disponivel', done: previewAvailable },
  ];

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Progresso da landing page</h3>
        <span className="text-xs text-muted-foreground">
          {steps.filter((step) => step.done).length}/{steps.length} etapas concluidas
        </span>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                step.done
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-border bg-surface/60 text-muted-foreground'
              }`}
            >
              {step.done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Clock className="h-3.5 w-3.5" aria-hidden="true" />}
              {step.label}
            </div>
            {index < steps.length - 1 && <span className="h-px w-3 shrink-0 bg-border" aria-hidden="true" />}
          </div>
        ))}
        <span className="h-px w-3 shrink-0 bg-border" aria-hidden="true" />
        <div className="flex items-center gap-2 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
          Publicacao (etapa futura)
        </div>
      </div>
    </Card>
  );
}

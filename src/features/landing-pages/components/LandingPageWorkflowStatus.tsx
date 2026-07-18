import { Check, Clock } from 'lucide-react';
import { Card } from '../../../components/ui';

interface LandingPageWorkflowStatusProps {
  briefingSaved: boolean;
  briefingAttached: boolean;
  analysisDone: boolean;
  contentGenerated: boolean;
  previewAvailable: boolean;
  published: boolean;
  aiEnabled?: boolean;
}

interface StepDefinition {
  key: string;
  label: string;
  done: boolean;
}

// Progresso puramente visual, derivado do state ja existente na aba (nao introduz nenhuma query
// nova nem persiste nada).
export function LandingPageWorkflowStatus({
  briefingSaved,
  briefingAttached,
  analysisDone,
  contentGenerated,
  previewAvailable,
  published,
  aiEnabled = true,
}: LandingPageWorkflowStatusProps) {
  const steps: StepDefinition[] = [
    { key: 'briefing', label: 'Briefing salvo', done: briefingSaved },
    { key: 'attachment', label: 'Briefing anexado', done: briefingAttached },
    ...(aiEnabled
      ? [
          { key: 'analysis', label: 'Analise IA realizada', done: analysisDone },
          { key: 'content', label: 'Conteudo gerado', done: contentGenerated },
        ]
      : []),
    { key: 'preview', label: 'Preview disponivel', done: previewAvailable },
    { key: 'publication', label: 'Publicada', done: published },
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
      </div>
    </Card>
  );
}

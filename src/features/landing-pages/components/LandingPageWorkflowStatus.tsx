import { Check, Clock } from 'lucide-react';

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
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
        {steps.map((step) => (
          <div
            key={step.key}
            className={`flex items-center gap-1.5 text-xs font-medium ${step.done ? 'text-success' : 'text-muted-foreground'}`}
          >
            {step.done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Clock className="h-3.5 w-3.5" aria-hidden="true" />}
            {step.label}
          </div>
        ))}
      </div>
      <span className="text-caption shrink-0">
        {steps.filter((step) => step.done).length}/{steps.length} concluídas
      </span>
    </div>
  );
}

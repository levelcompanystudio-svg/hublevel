interface StepBadgeProps {
  step: number;
}

// Numero de etapa reaproveitado nos cards da aba Landing Page, so para reforcar a ordem
// operacional esperada (briefing -> anexos -> analise -> geracao -> preview). Puramente visual.
export function StepBadge({ step }: StepBadgeProps) {
  return (
    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">
      {step}
    </span>
  );
}

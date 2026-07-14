interface ErrorStateProps {
  title?: string;
  description: string;
}

export function ErrorState({
  title = 'Algo saiu do esperado',
  description,
}: ErrorStateProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-5">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-destructive/40 bg-destructive/15 text-xs font-bold text-destructive">
        !
      </span>
      <div>
        <p className="text-sm font-semibold text-destructive">{title}</p>
        <p className="mt-1 text-sm leading-6 text-destructive/80">{description}</p>
      </div>
    </div>
  );
}

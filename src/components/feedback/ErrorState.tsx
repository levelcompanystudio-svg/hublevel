import { AlertTriangle } from 'lucide-react';

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
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-destructive/40 bg-destructive/15 text-destructive">
        <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
      </span>
      <div>
        <p className="text-sm font-semibold text-destructive">{title}</p>
        <p className="mt-1 text-sm leading-6 text-destructive/80">{description}</p>
      </div>
    </div>
  );
}

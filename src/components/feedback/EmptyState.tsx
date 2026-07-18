import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface/40 p-8 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-muted text-muted-foreground">
        <Inbox className="h-4 w-4" aria-hidden="true" />
      </div>
      <p className="text-h3 text-foreground">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

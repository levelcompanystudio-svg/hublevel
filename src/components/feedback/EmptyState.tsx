interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/50 p-10 text-center">
      <div className="mx-auto mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-xs font-bold text-primary">
        HL
      </div>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
    </div>
  );
}

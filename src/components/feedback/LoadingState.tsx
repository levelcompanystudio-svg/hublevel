interface LoadingStateProps {
  title?: string;
  description?: string;
}

export function LoadingState({
  title = 'Carregando',
  description = 'Preparando as informacoes do HubLevel.',
}: LoadingStateProps) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center gap-4 text-center">
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" />
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

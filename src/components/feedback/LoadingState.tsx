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
      <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
      <div>
        <p className="text-sm font-semibold text-slate-100">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>
    </div>
  );
}

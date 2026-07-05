interface ErrorStateProps {
  title?: string;
  description: string;
}

export function ErrorState({
  title = 'Algo saiu do esperado',
  description,
}: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-6">
      <p className="text-sm font-semibold text-red-200">{title}</p>
      <p className="mt-2 text-sm text-red-100/80">{description}</p>
    </div>
  );
}

import type { ReactNode } from 'react';

interface FilterBarProps {
  children?: ReactNode;
  label?: string;
}

export function FilterBar({ children, label = 'Visualizacao' }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface/90 px-4 py-3.5 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
      <p className="shrink-0 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap items-center gap-2">{children}</div>
    </div>
  );
}

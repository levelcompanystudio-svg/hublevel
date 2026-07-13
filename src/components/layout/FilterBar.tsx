import type { ReactNode } from 'react';

interface FilterBarProps {
  children?: ReactNode;
  label?: string;
}

export function FilterBar({ children, label = 'Visualizacao' }: FilterBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

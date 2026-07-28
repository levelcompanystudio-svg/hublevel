import type { ReactNode } from 'react';
import { Button, Card } from '../ui';

interface FilterPanelProps {
  quickFilters: ReactNode;
  children: ReactNode;
  filtersActive?: boolean;
  onClearFilters?: () => void;
}

export function FilterPanel({ quickFilters, children, filtersActive = false, onClearFilters }: FilterPanelProps) {
  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-1.5">{quickFilters}</div>
      <div className="mt-3.5 flex flex-col gap-3 border-t border-border/70 pt-3.5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex-1">{children}</div>
        {filtersActive && onClearFilters && (
          <Button type="button" variant="ghost" size="sm" onClick={onClearFilters} className="shrink-0">
            Limpar filtros
          </Button>
        )}
      </div>
    </Card>
  );
}

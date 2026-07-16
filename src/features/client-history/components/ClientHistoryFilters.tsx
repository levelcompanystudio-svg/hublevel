import { FilterBar } from '../../../components/layout/FilterBar';
import { clientHistoryEventTypeLabels } from '../client-history.types';
import type { ClientHistoryEventType } from '../client-history.types';

export type ClientHistoryFilter = 'todos' | ClientHistoryEventType;

interface ClientHistoryFiltersProps {
  active: ClientHistoryFilter;
  counts: Record<ClientHistoryFilter, number>;
  onChange: (filter: ClientHistoryFilter) => void;
}

const options: ClientHistoryFilter[] = ['todos', 'task', 'update', 'meeting', 'document', 'deliverable', 'landing_page'];

function optionLabel(filter: ClientHistoryFilter): string {
  return filter === 'todos' ? 'Todos' : clientHistoryEventTypeLabels[filter];
}

export function ClientHistoryFilters({ active, counts, onChange }: ClientHistoryFiltersProps) {
  return (
    <FilterBar label="Filtrar por tipo">
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
              active === option
                ? 'border-primary/60 bg-primary text-primary-foreground shadow-[0_4px_14px_-4px_var(--color-primary)]'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {optionLabel(option)} ({counts[option] ?? 0})
          </button>
        ))}
      </div>
    </FilterBar>
  );
}

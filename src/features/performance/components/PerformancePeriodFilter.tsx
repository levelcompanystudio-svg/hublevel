import type { PerformancePeriodPreset, PerformancePeriodRange } from '../performance-period';
import { resolvePerformancePeriodRange } from '../performance-period';

interface PerformancePeriodFilterProps {
  value: PerformancePeriodRange;
  onChange: (period: PerformancePeriodRange) => void;
}

const PRESETS: Array<{ value: PerformancePeriodPreset; label: string }> = [
  { value: 'this_month', label: 'Este mes' },
  { value: 'last_7_days', label: '7 dias' },
  { value: 'last_30_days', label: '30 dias' },
  { value: 'custom', label: 'Personalizado' },
];

export function PerformancePeriodFilter({ value, onChange }: PerformancePeriodFilterProps) {
  function handlePresetClick(preset: PerformancePeriodPreset) {
    if (preset === 'custom') {
      onChange(resolvePerformancePeriodRange({ preset: 'custom', startDate: value.startDate, endDate: value.endDate }));
      return;
    }
    onChange(resolvePerformancePeriodRange({ preset }));
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map((preset) => (
          <button
            key={preset.value}
            type="button"
            onClick={() => handlePresetClick(preset.value)}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
              value.preset === preset.value
                ? 'border-primary/60 bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      {value.preset === 'custom' && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={value.startDate}
            max={value.endDate}
            onChange={(event) => onChange(resolvePerformancePeriodRange({ preset: 'custom', startDate: event.target.value, endDate: value.endDate }))}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground"
          />
          <span className="text-xs text-muted-foreground">ate</span>
          <input
            type="date"
            value={value.endDate}
            min={value.startDate}
            onChange={(event) => onChange(resolvePerformancePeriodRange({ preset: 'custom', startDate: value.startDate, endDate: event.target.value }))}
            className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs text-foreground"
          />
        </div>
      )}
    </div>
  );
}

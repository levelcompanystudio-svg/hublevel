interface MeetingSettingSelectProps<T extends string> {
  value: T;
  options: T[];
  labels: Record<T, string>;
  disabled?: boolean;
  onChange: (value: T) => void;
}

export function MeetingSettingSelect<T extends string>({
  value,
  options,
  labels,
  disabled = false,
  onChange,
}: MeetingSettingSelectProps<T>) {
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as T)}
      className="rounded-md border border-border bg-surface px-2 py-1.5 text-xs font-medium text-foreground transition-colors duration-150 hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:opacity-50"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {labels[option]}
        </option>
      ))}
    </select>
  );
}

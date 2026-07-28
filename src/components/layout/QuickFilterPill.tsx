interface QuickFilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

export function QuickFilterPill({ label, active, onClick }: QuickFilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors duration-150 ${
        active
          ? 'border-primary/60 bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
      }`}
    >
      {label}
    </button>
  );
}

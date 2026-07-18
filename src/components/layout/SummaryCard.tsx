import { Card } from '../ui';

interface SummaryCardProps {
  label: string;
  value: string | number;
  description?: string;
  tone?: 'neutral' | 'brand' | 'success' | 'warning';
  density?: 'default' | 'compact';
}

const dotTones = {
  neutral: 'bg-muted-foreground/50',
  brand: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
};

export function SummaryCard({ label, value, description, tone = 'neutral', density = 'default' }: SummaryCardProps) {
  const compact = density === 'compact';

  return (
    <Card className={compact ? 'p-3' : 'p-4'}>
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={`${compact ? 'h-1 w-1' : 'h-1.5 w-1.5'} shrink-0 rounded-full ${dotTones[tone]}`} aria-hidden="true" />
        <p className={`${compact ? 'truncate text-[11px]' : 'text-caption'} uppercase tracking-wide text-muted-foreground`}>{label}</p>
      </div>
      <p className={`${compact ? 'mt-1 text-xl leading-7' : 'text-h1 mt-2'} truncate font-semibold text-foreground`}>{value}</p>
      {description && <p className={`${compact ? 'mt-0.5 truncate text-[11px] leading-4' : 'mt-1 text-xs leading-5'} text-muted-foreground`}>{description}</p>}
    </Card>
  );
}

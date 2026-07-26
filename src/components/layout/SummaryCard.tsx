import { Card } from '../ui';

interface SummaryCardProps {
  label: string;
  value: string | number;
  description?: string;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'destructive';
  density?: 'default' | 'compact';
}

const dotTones = {
  neutral: 'bg-muted-foreground/50',
  brand: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

export function SummaryCard({ label, value, description, tone = 'neutral', density = 'default' }: SummaryCardProps) {
  const compact = density === 'compact';

  return (
    <Card density={density}>
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={`${compact ? 'h-1 w-1' : 'h-1.5 w-1.5'} shrink-0 rounded-full ${dotTones[tone]}`} aria-hidden="true" />
        <p className={`${compact ? 'truncate text-xs' : 'text-caption'} uppercase tracking-wide text-muted-foreground`}>{label}</p>
      </div>
      <p className={`${compact ? 'mt-1 text-xl leading-7' : 'text-h1 mt-2'} truncate font-semibold text-foreground`}>{value}</p>
      {description && <p className={`${compact ? 'mt-0.5 truncate text-xs leading-4' : 'mt-1 text-xs leading-5'} text-muted-foreground`}>{description}</p>}
    </Card>
  );
}

import { Card } from '../ui';

interface SummaryCardProps {
  label: string;
  value: string | number;
  description?: string;
  tone?: 'neutral' | 'brand' | 'success' | 'warning';
}

export function SummaryCard({ label, value, description, tone = 'neutral' }: SummaryCardProps) {
  const tones = {
    neutral: { gradient: 'from-muted/80 to-card', bar: 'bg-muted-foreground/40' },
    brand: { gradient: 'from-primary/15 to-card', bar: 'bg-primary' },
    success: { gradient: 'from-success/15 to-card', bar: 'bg-success' },
    warning: { gradient: 'from-warning/15 to-card', bar: 'bg-warning' },
  };

  return (
    <Card className={`overflow-hidden bg-gradient-to-br transition hover:border-primary/40 ${tones[tone].gradient}`}>
      <span className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${tones[tone].bar}`} aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{value}</p>
      {description && <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>}
    </Card>
  );
}

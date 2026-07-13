import { Card } from '../ui';

interface SummaryCardProps {
  label: string;
  value: string | number;
  description?: string;
  tone?: 'neutral' | 'brand' | 'success' | 'warning';
}

export function SummaryCard({ label, value, description, tone = 'neutral' }: SummaryCardProps) {
  const tones = {
    neutral: 'from-muted/80 to-card',
    brand: 'from-primary/15 to-card',
    success: 'from-success/15 to-card',
    warning: 'from-warning/15 to-card',
  };

  return (
    <Card className={`bg-gradient-to-br ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-foreground">{value}</p>
      {description && <p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>}
    </Card>
  );
}

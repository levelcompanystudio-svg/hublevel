import { Card } from '../ui';

interface SummaryCardProps {
  label: string;
  value: string | number;
  description?: string;
  tone?: 'neutral' | 'brand' | 'success' | 'warning';
}

const dotTones = {
  neutral: 'bg-muted-foreground/50',
  brand: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
};

export function SummaryCard({ label, value, description, tone = 'neutral' }: SummaryCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotTones[tone]}`} aria-hidden="true" />
        <p className="text-caption uppercase tracking-wide">{label}</p>
      </div>
      <p className="text-h1 mt-2 text-foreground">{value}</p>
      {description && <p className="mt-1 text-xs leading-5 text-muted-foreground">{description}</p>}
    </Card>
  );
}

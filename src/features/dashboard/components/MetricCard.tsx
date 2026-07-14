import { Card } from '../../../components/ui';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
}

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="min-h-36 transition hover:border-primary/40">
      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-foreground">{value}</p>
        </div>
        <p className="text-xs leading-5 text-muted-foreground">{description}</p>
      </div>
    </Card>
  );
}

import { Card } from '../../../components/ui';

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
}

export function MetricCard({ title, value, description }: MetricCardProps) {
  return (
    <Card className="min-h-36">
      <div className="flex h-full flex-col justify-between gap-5">
        <div>
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-100">{value}</p>
        </div>
        <p className="text-xs leading-5 text-slate-500">{description}</p>
      </div>
    </Card>
  );
}

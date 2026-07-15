import { Card } from '../../../components/ui';

interface PerformanceMetricCardProps {
  label: string;
  value: number | null;
  format?: (value: number) => string;
}

export function PerformanceMetricCard({ label, value, format }: PerformanceMetricCardProps) {
  return (
    <Card className={value === null ? 'border-dashed' : undefined}>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      {value !== null ? (
        <p className="mt-3 text-2xl font-bold tracking-tight text-foreground">{format ? format(value) : value}</p>
      ) : (
        <p className="mt-3 text-lg font-semibold text-muted-foreground">Sem dados</p>
      )}
      <p className="mt-2 text-xs text-muted-foreground">
        {value === null ? 'Aguardando integracao' : 'Fonte: integracao conectada'}
      </p>
    </Card>
  );
}

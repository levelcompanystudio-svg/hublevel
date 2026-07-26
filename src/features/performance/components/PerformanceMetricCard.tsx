import { Card } from '../../../components/ui';

interface PerformanceMetricCardProps {
  label: string;
  value: number | null;
  format?: (value: number) => string;
  emptyLabel?: string;
  emptyHint?: string;
}

export function PerformanceMetricCard({
  label,
  value,
  format,
  emptyLabel = 'Sem dados',
  emptyHint = 'Aguardando integracao',
}: PerformanceMetricCardProps) {
  return (
    <Card className={value === null ? 'border-dashed' : undefined}>
      <p className="text-caption uppercase">{label}</p>
      {value !== null ? (
        <p className="mt-2 text-xl font-semibold tracking-tight text-foreground">{format ? format(value) : value}</p>
      ) : (
        <p className="mt-2 text-lg font-semibold text-muted-foreground">{emptyLabel}</p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        {value === null ? emptyHint : 'Dados reais sincronizados'}
      </p>
    </Card>
  );
}

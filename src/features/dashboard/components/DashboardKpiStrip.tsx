import type { ReactNode } from 'react';
import { Card } from '../../../components/ui';

interface DashboardKpiItem {
  label: string;
  value: ReactNode;
  description?: string;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'destructive';
}

interface DashboardKpiStripProps {
  items: DashboardKpiItem[];
}

const dotTones: Record<NonNullable<DashboardKpiItem['tone']>, string> = {
  neutral: 'bg-muted-foreground/50',
  brand: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

// Substitui um StatsGrid de N cards soltos por um unico container: mesmos dados, mas lidos como
// um bloco so ("visao geral"), nao como N caixas competindo por atencao.
export function DashboardKpiStrip({ items }: DashboardKpiStripProps) {
  return (
    <Card className="p-0">
      <div className="flex flex-col divide-y divide-border sm:flex-row sm:divide-x sm:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className="flex-1 p-4">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotTones[item.tone ?? 'neutral']}`} aria-hidden="true" />
              <p className="text-caption truncate uppercase tracking-wide text-muted-foreground">{item.label}</p>
            </div>
            <p className="text-h1 mt-2 font-semibold text-foreground">{item.value}</p>
            {item.description && <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}

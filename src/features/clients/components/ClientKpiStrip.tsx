import type { ReactNode } from 'react';
import { Card } from '../../../components/ui';

interface ClientKpiItem {
  label: string;
  value: ReactNode;
  description?: string;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'destructive';
}

interface ClientKpiStripProps {
  items: ClientKpiItem[];
  density?: 'default' | 'compact';
}

const dotTones: Record<NonNullable<ClientKpiItem['tone']>, string> = {
  neutral: 'bg-muted-foreground/50',
  brand: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  destructive: 'bg-destructive',
};

// Um unico container com divisores em vez de N cards soltos: mesmos indicadores, lidos como um
// bloco so ("carteira" ou "conta"), nao como caixas competindo por atencao. Fica em coluna unica
// ate `lg` (nunca quebra linha de forma imprevisivel) e vira uma linha so, sem wrap, a partir dai.
export function ClientKpiStrip({ items, density = 'default' }: ClientKpiStripProps) {
  const compact = density === 'compact';

  return (
    <Card className="p-0">
      <div className="flex flex-col divide-y divide-border lg:flex-row lg:divide-x lg:divide-y-0">
        {items.map((item) => (
          <div key={item.label} className={`flex-1 ${compact ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotTones[item.tone ?? 'neutral']}`} aria-hidden="true" />
              <p className="text-caption truncate uppercase tracking-wide text-muted-foreground">{item.label}</p>
            </div>
            <p className={`${compact ? 'mt-1 text-lg' : 'text-h1 mt-2'} truncate font-semibold text-foreground`}>{item.value}</p>
            {item.description && <p className="mt-1 truncate text-xs text-muted-foreground">{item.description}</p>}
          </div>
        ))}
      </div>
    </Card>
  );
}

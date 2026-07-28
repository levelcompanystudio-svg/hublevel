import { Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Service } from '../services.types';
import { formatPrice } from './ServiceTable';
import { BillingCycleBadge } from './BillingCycleBadge';
import { ServiceStatusBadge } from './ServiceStatusBadge';

interface ServiceCatalogGridProps {
  services: Service[];
  canEdit: boolean;
}

export function ServiceCatalogGrid({ services, canEdit }: ServiceCatalogGridProps) {
  if (services.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum servico cadastrado"
          description="O catalogo de servicos sera exibido aqui conforme os registros forem criados."
        />
      </Card>
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {services.map((service) => (
        <Card key={service.id} className="flex min-h-full flex-col gap-4 transition-colors duration-150 hover:bg-card-elevated">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground">
                <Package className="h-4.5 w-4.5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <h3 className="truncate text-h3 text-foreground">{service.name}</h3>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{service.category || 'Sem categoria'}</p>
              </div>
            </div>
            <ServiceStatusBadge status={service.status} />
          </div>

          <p className="line-clamp-2 text-sm text-muted-foreground">{service.description || 'Sem descricao cadastrada.'}</p>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border/70 pt-3">
            <div>
              <p className="text-caption uppercase text-muted-foreground">Preco padrao</p>
              <p className="mt-1 text-lg font-semibold tabular-nums text-foreground">{formatPrice(service.default_price)}</p>
            </div>
            <BillingCycleBadge cycle={service.billing_cycle} />
          </div>

          <div className="flex items-center gap-2">
            <Link to={`/app/servicos/${service.id}`} className="flex-1">
              <Button type="button" variant="secondary" className="w-full">Ver</Button>
            </Link>
            {canEdit && (
              <Link to={`/app/servicos/${service.id}/editar`} className="flex-1">
                <Button type="button" className="w-full">Editar</Button>
              </Link>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

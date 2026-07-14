import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Service } from '../services.types';
import { BillingCycleBadge } from './BillingCycleBadge';
import { ServiceStatusBadge } from './ServiceStatusBadge';

interface ServiceTableProps {
  services: Service[];
  canEdit: boolean;
}

export function ServiceTable({ services, canEdit }: ServiceTableProps) {
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
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Nome</th>
              <th className="px-5 py-3.5 font-semibold">Categoria</th>
              <th className="px-5 py-3.5 font-semibold">Preco padrao</th>
              <th className="px-5 py-3.5 font-semibold">Ciclo de cobranca</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {services.map((service) => (
              <tr key={service.id} className="bg-card transition-colors hover:bg-muted/30">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{service.name}</p>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {service.description || 'Sem descricao'}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{service.category || '-'}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatPrice(service.default_price)}</td>
                <td className="px-5 py-4">
                  <BillingCycleBadge cycle={service.billing_cycle} />
                </td>
                <td className="px-5 py-4">
                  <ServiceStatusBadge status={service.status} />
                </td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/app/servicos/${service.id}`}>
                      <Button type="button" variant="ghost">
                        Ver
                      </Button>
                    </Link>
                    {canEdit && (
                      <Link to={`/app/servicos/${service.id}/editar`}>
                        <Button type="button">
                          Editar
                        </Button>
                      </Link>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function formatPrice(value: number | null): string {
  if (value === null) return '-';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getService } from '../services.api';
import type { Service } from '../services.types';
import { BillingCycleBadge } from '../components/BillingCycleBadge';
import { ServiceHeader } from '../components/ServiceHeader';
import { formatPrice } from '../components/ServiceTable';
import { ServiceStatusBadge } from '../components/ServiceStatusBadge';

export function ServiceDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';
  const canEdit = role === 'admin';

  useEffect(() => {
    if (!id || !canAccess) {
      setLoading(false);
      return;
    }

    let active = true;
    const serviceId = id;

    async function loadService() {
      try {
        setLoading(true);
        setError(null);
        const result = await getService(serviceId, canEdit);
        if (active) setService(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar servico.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadService();

    return () => {
      active = false;
    };
  }, [canAccess, canEdit, id]);

  if (!canAccess) {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <ServiceHeader
        title={service?.name ?? 'Servico'}
        description="Visualizacao individual do servico no catalogo interno da Level Company."
      />

      {loading && <LoadingState title="Carregando servico" />}
      {error && <ErrorState description={error} />}

      {!loading && service && (
        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{service.description || 'Sem descricao cadastrada'}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <ServiceStatusBadge status={service.status} />
                <BillingCycleBadge cycle={service.billing_cycle} />
              </div>
            </div>
            {canEdit && (
              <Link to={`/app/servicos/${service.id}/editar`}>
                <Button type="button">Editar servico</Button>
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <InfoItem label="Categoria" value={service.category ?? '-'} />
            <InfoItem label="Preco padrao" value={formatPrice(service.default_price)} />
            <InfoItem label="Status" value={service.status === 'ativo' ? 'Ativo' : 'Inativo'} />
            <InfoItem label="Atualizado em" value={formatDate(service.updated_at)} />
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Observacoes</p>
            <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
              {service.notes || 'Nenhuma observacao cadastrada.'}
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { KpiStrip } from '../../../components/layout/KpiStrip';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Badge, Button } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listServices } from '../services.api';
import type { Service } from '../services.types';
import { ServiceCatalogGrid } from '../components/ServiceCatalogGrid';

export function ServiceListPage() {
  const { profile } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';
  const canEdit = role === 'admin';

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadServices() {
      try {
        setLoading(true);
        setError(null);
        const result = await listServices(canEdit);
        if (active) setServices(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar servicos.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadServices();

    return () => {
      active = false;
    };
  }, [canAccess, canEdit]);

  if (!canAccess) {
    return <AccessDeniedPlaceholder />;
  }

  const activeServices = services.filter((service) => service.status === 'ativo').length;
  const inactiveServices = services.filter((service) => service.status === 'inativo').length;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Catalogo"
        title="Servicos"
        description="Catalogo interno de servicos da Level Company para operacao e contratos futuros."
        action={canEdit ? (
          <Link to="/app/servicos/novo">
            <Button type="button" variant="primary">Novo servico</Button>
          </Link>
        ) : undefined}
      />

      {loading && <LoadingState title="Carregando servicos" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <KpiStrip
            items={[
              { label: 'Total de servicos', value: services.length, tone: 'brand' },
              { label: 'Servicos ativos', value: activeServices, tone: 'success' },
              { label: 'Servicos inativos', value: inactiveServices, tone: 'neutral' },
            ]}
          />
          <FilterBar label="Contexto">
            <Badge tone="brand">{canEdit ? 'Todos os status' : 'Apenas ativos'}</Badge>
            <Badge>Catalogo interno</Badge>
          </FilterBar>
          <ServiceCatalogGrid services={services} canEdit={canEdit} />
        </>
      )}
    </div>
  );
}

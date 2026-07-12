import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listServices } from '../services.api';
import type { Service } from '../services.types';
import { ServiceHeader } from '../components/ServiceHeader';
import { ServiceTable } from '../components/ServiceTable';

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

  return (
    <div className="space-y-6">
      <ServiceHeader
        title="Servicos"
        description="Catalogo interno de servicos da Level Company para operacao e contratos futuros."
        actionLabel={canEdit ? 'Novo servico' : undefined}
        actionTo={canEdit ? '/app/servicos/novo' : undefined}
      />

      {loading && <LoadingState title="Carregando servicos" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && <ServiceTable services={services} canEdit={canEdit} />}
    </div>
  );
}

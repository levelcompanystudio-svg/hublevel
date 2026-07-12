import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listClients } from '../clients.api';
import type { Client } from '../clients.types';
import { ClientHeader } from '../components/ClientHeader';
import { ClientTable } from '../components/ClientTable';

export function ClientListPage() {
  const { profile } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;

  useEffect(() => {
    if (role !== 'admin' && role !== 'gestor') {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadClients() {
      try {
        setLoading(true);
        setError(null);
        const result = await listClients();
        if (active) setClients(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar clientes.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadClients();

    return () => {
      active = false;
    };
  }, [role]);

  if (role !== 'admin' && role !== 'gestor') {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <ClientHeader
        title="Clientes"
        description="Carteira operacional de clientes da Level Company."
        actionLabel="Novo cliente"
        actionTo="/app/clientes/novo"
      />

      {loading && <LoadingState title="Carregando clientes" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && <ClientTable clients={clients} />}
    </div>
  );
}

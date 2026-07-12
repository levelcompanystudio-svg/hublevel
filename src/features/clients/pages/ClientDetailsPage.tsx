import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getClient } from '../clients.api';
import type { Client } from '../clients.types';
import { ClientHeader } from '../components/ClientHeader';
import { ClientHealthBadge } from '../components/ClientHealthBadge';
import { ClientStatusBadge } from '../components/ClientStatusBadge';

export function ClientDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;

  useEffect(() => {
    if (!id || (role !== 'admin' && role !== 'gestor')) {
      setLoading(false);
      return;
    }

    let active = true;
    const clientId = id;

    async function loadClient() {
      try {
        setLoading(true);
        setError(null);
        const result = await getClient(clientId);
        if (active) setClient(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar cliente.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadClient();

    return () => {
      active = false;
    };
  }, [id, role]);

  if (role !== 'admin' && role !== 'gestor') {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <ClientHeader
        title={client?.company_name ?? 'Cliente'}
        description="Visao individual do cliente e blocos operacionais preparados para proximas etapas."
      />

      {loading && <LoadingState title="Carregando cliente" />}
      {error && <ErrorState description={error} />}

      {!loading && client && (
        <>
          <Card>
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm text-slate-500">{client.trade_name || client.segment || 'Sem nome fantasia'}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <ClientStatusBadge status={client.status} />
                  <ClientHealthBadge status={client.health_status} />
                </div>
              </div>
              <Link to={`/app/clientes/${client.id}/editar`}>
                <Button type="button">Editar cliente</Button>
              </Link>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <InfoItem label="Documento" value={client.document_number ?? '-'} />
              <InfoItem label="Segmento" value={client.segment ?? '-'} />
              <InfoItem label="Responsavel" value={client.responsible?.name ?? '-'} />
              <InfoItem label="Inicio" value={client.start_date ?? '-'} />
            </div>

            {client.notes && (
              <div className="mt-6 rounded-md border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-xs font-semibold uppercase text-slate-500">Observacoes</p>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-300">{client.notes}</p>
              </div>
            )}
          </Card>

          <div className="grid gap-4 lg:grid-cols-2">
            <PlaceholderBlock title="Servicos contratados" />
            <PlaceholderBlock title="Contratos" />
            <PlaceholderBlock title="Financeiro" />
            <PlaceholderBlock title="Tarefas" />
            <PlaceholderBlock title="Reunioes" />
            <PlaceholderBlock title="Atualizacoes" />
          </div>
        </>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

function PlaceholderBlock({ title }: { title: string }) {
  return (
    <Card>
      <h3 className="text-sm font-semibold text-slate-100">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">
        Bloco reservado visualmente. Implementacao prevista na etapa correspondente.
      </p>
    </Card>
  );
}

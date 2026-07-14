import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge, Button, Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getUpdate } from '../updates.api';
import type { Update } from '../updates.types';
import { UpdateHeader } from '../components/UpdateHeader';
import { UpdateStatusBadge } from '../components/UpdateStatusBadge';
import { clientName, formatDate, responsibleName } from '../components/UpdateTable';

export function UpdateDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [update, setUpdate] = useState<Update | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  useEffect(() => {
    if (!id || !canAccess) {
      setLoading(false);
      return;
    }

    let active = true;
    const updateId = id;

    async function loadUpdate() {
      try {
        setLoading(true);
        setError(null);
        const result = await getUpdate(updateId);
        if (active) setUpdate(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar atualizacao.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadUpdate();

    return () => {
      active = false;
    };
  }, [canAccess, id]);

  if (!canAccess) {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <UpdateHeader title={update?.title ?? 'Atualizacao'} description="Detalhe da atualizacao de acompanhamento." />

      {loading && <LoadingState title="Carregando atualizacao" />}
      {error && <ErrorState description={error} />}

      {!loading && update && (
        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{clientName(update)}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <UpdateStatusBadge status={update.status} />
                {update.sent_to_client && <Badge tone="success">Enviada ao cliente</Badge>}
                {update.category && <Badge>{update.category}</Badge>}
              </div>
            </div>
            <Link to={`/app/acompanhamento/${update.id}/editar`}>
              <Button type="button">Editar atualizacao</Button>
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Responsavel" value={responsibleName(update)} />
            <InfoItem label="Data da atualizacao" value={formatDate(update.update_date)} />
            <InfoItem label="Enviada ao cliente" value={update.sent_to_client ? 'Sim' : 'Nao'} />
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Descricao</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{update.description}</p>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Proxima acao</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {update.next_action || 'Nenhuma proxima acao registrada.'}
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

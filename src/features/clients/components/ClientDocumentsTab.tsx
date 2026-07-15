import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { listDocumentsByClient } from '../../documents/documents.api';
import type { Document } from '../../documents/documents.types';
import { DocumentTypeBadge } from '../../documents/components/DocumentTypeBadge';
import { creatorName, formatDate } from '../../documents/components/DocumentTable';

interface ClientDocumentsTabProps {
  clientId: string;
  canCreate: boolean;
  canEdit: boolean;
}

export function ClientDocumentsTab({ clientId, canCreate, canEdit }: ClientDocumentsTabProps) {
  const [items, setItems] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listDocumentsByClient(clientId);
      setItems(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar documentos do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-4">
      {canCreate && (
        <div className="flex justify-end">
          <Link to={`/app/documentos/novo?client_id=${clientId}`}>
            <Button type="button" variant="primary">Novo documento</Button>
          </Link>
        </div>
      )}

      {loading && <LoadingState title="Carregando documentos do cliente" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        items.length === 0 ? (
          <EmptyState
            title="Nenhum documento cadastrado"
            description="Contratos, propostas, briefings e demais documentos deste cliente aparecerao aqui."
          />
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <Card key={item.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{item.title}</p>
                      <DocumentTypeBadge type={item.type} />
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDate(item.created_at)} - Criado por {creatorName(item)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Link to={`/app/documentos/${item.id}`}>
                      <Button type="button" variant="ghost">Ver</Button>
                    </Link>
                    {canEdit && (
                      <Link to={`/app/documentos/${item.id}/editar`}>
                        <Button type="button" variant="secondary">Editar</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )
      )}
    </div>
  );
}

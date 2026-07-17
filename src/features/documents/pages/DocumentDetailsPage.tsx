import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getDocument, getDocumentFileSignedUrl } from '../documents.api';
import type { Document } from '../documents.types';
import { DocumentHeader } from '../components/DocumentHeader';
import { DocumentTypeBadge } from '../components/DocumentTypeBadge';
import { clientName, creatorName, formatDate } from '../components/DocumentTable';

export function DocumentDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openingFile, setOpeningFile] = useState(false);
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';
  const canEdit = role === 'admin';

  useEffect(() => {
    if (!id || !canAccess) {
      setLoading(false);
      return;
    }

    let active = true;
    const documentId = id;

    async function loadDocument() {
      try {
        setLoading(true);
        setError(null);
        const result = await getDocument(documentId);
        if (active) setDoc(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar documento.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadDocument();

    return () => {
      active = false;
    };
  }, [canAccess, id]);

  if (!canAccess) {
    return <AccessDeniedPlaceholder />;
  }

  async function handleOpenFile() {
    if (!doc?.file_url) return;

    try {
      setOpeningFile(true);
      const signedUrl = await getDocumentFileSignedUrl(doc.file_url);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao abrir arquivo.');
    } finally {
      setOpeningFile(false);
    }
  }

  return (
    <div className="space-y-6">
      <DocumentHeader title={doc?.title ?? 'Documento'} description="Detalhe do documento vinculado ao cliente." />

      {loading && <LoadingState title="Carregando documento" />}
      {error && <ErrorState description={error} />}

      {!loading && doc && (
        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <Link to={`/app/clientes/${doc.client_id}`} className="text-sm text-primary hover:underline">
                {clientName(doc)}
              </Link>
              <div className="mt-4">
                <DocumentTypeBadge type={doc.type} />
              </div>
            </div>
            {canEdit && (
              <Link to={`/app/documentos/${doc.id}/editar`}>
                <Button type="button">Editar documento</Button>
              </Link>
            )}
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Criado por" value={creatorName(doc)} />
            <InfoItem label="Criado em" value={formatDate(doc.created_at)} />
            <InfoItem label="Atualizado em" value={formatDate(doc.updated_at)} />
          </div>

          <div className="mt-6 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Descricao</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
              {doc.description || 'Nenhuma descricao cadastrada.'}
            </p>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Arquivo salvo no HubLevel</p>
            {doc.file_url ? (
              <Button type="button" variant="secondary" disabled={openingFile} onClick={() => void handleOpenFile()}>
                {openingFile ? 'Abrindo...' : 'Abrir arquivo'}
              </Button>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Nenhum arquivo anexado.</p>
            )}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Link externo</p>
            {doc.external_url ? (
              <a
                href={doc.external_url}
                target="_blank"
                rel="noreferrer"
                className="mt-2 block break-all text-sm text-primary underline underline-offset-2 hover:brightness-110"
              >
                {doc.external_url}
              </a>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Nenhuma URL cadastrada.</p>
            )}
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

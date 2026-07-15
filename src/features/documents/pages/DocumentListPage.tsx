import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { PageHeader } from '../../../components/layout/PageHeader';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { Badge, Button } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listDocuments } from '../documents.api';
import { SENSITIVE_DOCUMENT_TYPES } from '../documents.types';
import type { Document } from '../documents.types';
import { DocumentTable } from '../components/DocumentTable';

export function DocumentListPage() {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
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
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await listDocuments();
        if (active) setDocuments(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar documentos.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canAccess]);

  if (!canAccess) return <AccessDeniedPlaceholder />;

  const sensitiveDocuments = documents.filter((document) => SENSITIVE_DOCUMENT_TYPES.includes(document.type)).length;
  const operationalDocuments = documents.length - sensitiveDocuments;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Operacao"
        title="Documentos"
        description="Contratos, propostas, briefings, relatorios e demais arquivos vinculados aos clientes."
        action={(
          <Link to="/app/documentos/novo">
            <Button type="button" variant="primary">Novo documento</Button>
          </Link>
        )}
      />

      {loading && <LoadingState title="Carregando documentos" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <SummaryCard label="Total de documentos" value={documents.length} tone="brand" />
            <SummaryCard label="Operacionais" value={operationalDocuments} tone="success" />
            <SummaryCard label="Sensiveis (contrato/comprovante)" value={sensitiveDocuments} tone="warning" />
          </div>
          <FilterBar label="Filtros visuais">
            <Badge tone="brand">{role === 'admin' ? 'Todos os documentos' : 'Documentos operacionais da carteira'}</Badge>
            <Badge>Vinculado a clientes</Badge>
          </FilterBar>
          <DocumentTable documents={documents} canEdit={canEdit} />
        </>
      )}
    </div>
  );
}

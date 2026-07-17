import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Badge, Button, Card } from '../../../components/ui';
import type { Document } from '../documents.types';
import { DocumentTypeBadge } from './DocumentTypeBadge';

interface DocumentTableProps {
  documents: Document[];
  canEdit: boolean;
}

export function DocumentTable({ documents, canEdit }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum documento cadastrado"
          description="Contratos, propostas, briefings e demais documentos vinculados aos clientes aparecerao aqui."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Documento</th>
              <th className="px-5 py-3.5 font-semibold">Cliente</th>
              <th className="px-5 py-3.5 font-semibold">Tipo</th>
              <th className="px-5 py-3.5 font-semibold">Criado em</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {documents.map((document) => (
              <tr key={document.id} className="bg-card transition-colors hover:bg-card-elevated">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{document.title}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {document.file_url && <Badge tone="brand">Arquivo</Badge>}
                    {document.external_url && <Badge tone="neutral">Link</Badge>}
                  </div>
                  <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                    {document.description || 'Sem descricao'}
                  </p>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  <Link to={`/app/clientes/${document.client_id}`} className="text-primary hover:underline">
                    {clientName(document)}
                  </Link>
                </td>
                <td className="px-5 py-4"><DocumentTypeBadge type={document.type} /></td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(document.created_at)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/app/documentos/${document.id}`}>
                      <Button type="button" variant="ghost">Ver</Button>
                    </Link>
                    {canEdit && (
                      <Link to={`/app/documentos/${document.id}/editar`}>
                        <Button type="button">Editar</Button>
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

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR').format(new Date(value));
}

export function clientName(document: Document): string {
  const client = Array.isArray(document.client) ? document.client[0] : document.client;
  return client?.trade_name || client?.company_name || 'Cliente';
}

export function creatorName(document: Document): string {
  const creator = Array.isArray(document.creator) ? document.creator[0] : document.creator;
  return creator?.name ?? '-';
}

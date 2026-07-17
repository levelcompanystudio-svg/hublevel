import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge, Button, Card } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { createDocument, listDocumentsByClient } from '../../documents/documents.api';
import type { Document } from '../../documents/documents.types';

interface LandingPageBriefingDocumentsProps {
  clientId: string;
  canManage: boolean;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

// Anexo de briefing reaproveita 100% a estrutura de `documents` ja existente (type: 'briefing'),
// sem tabela nova. O HubLevel ainda nao tem upload real de arquivo (Storage) para documentos -
// "anexar" aqui significa colar o link de um arquivo ja hospedado (Drive, Dropbox etc.), exatamente
// como o resto do modulo de Documentos ja funciona hoje.
export function LandingPageBriefingDocuments({ clientId, canManage }: LandingPageBriefingDocumentsProps) {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const all = await listDocumentsByClient(clientId);
        if (!active) return;
        setDocuments(all.filter((document) => document.type === 'briefing'));
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar briefings anexados.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [clientId]);

  async function handleAttach() {
    if (!profile || !canManage) return;

    const trimmedTitle = title.trim();
    const trimmedUrl = externalUrl.trim();

    if (!trimmedTitle) {
      setFormError('Informe um nome para o briefing.');
      return;
    }
    if (!/^https?:\/\//i.test(trimmedUrl)) {
      setFormError('Informe uma URL valida iniciada com http:// ou https://');
      return;
    }

    try {
      setSaving(true);
      setFormError(null);
      const created = await createDocument(
        {
          client_id: clientId,
          type: 'briefing',
          title: trimmedTitle,
          description: '',
          external_url: trimmedUrl,
        },
        profile.id,
      );
      setDocuments((current) => [created, ...current]);
      setTitle('');
      setExternalUrl('');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro ao anexar briefing.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Briefings anexados</h3>
        <Badge tone="brand">Uso futuro por IA</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Anexe aqui materiais de briefing que o cliente ja tenha pronto (documento, apresentacao, PDF hospedado em
        Drive/Dropbox etc.). Este material fica salvo no cliente e sera usado futuramente como fonte de leitura para
        a geracao de landing page com IA - ainda nao ha leitura automatica hoje.
      </p>

      {loading && <LoadingState title="Carregando briefings anexados" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        <div className="mt-4 space-y-2">
          {documents.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface/40 px-3 py-4 text-center text-xs text-muted-foreground">
              Nenhum briefing anexado ainda.
            </p>
          ) : (
            documents.map((document) => {
              const creator = firstRelation(document.creator);
              return (
                <div
                  key={document.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-surface/40 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    {document.external_url ? (
                      <a
                        href={document.external_url}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate text-sm font-semibold text-primary hover:underline"
                      >
                        {document.title}
                      </a>
                    ) : (
                      <p className="truncate text-sm font-semibold text-foreground">{document.title}</p>
                    )}
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      Enviado em {formatDate(document.created_at)}
                      {creator?.name ? ` por ${creator.name}` : ''}
                    </p>
                  </div>
                  <Badge tone="neutral">Briefing</Badge>
                </div>
              );
            })
          )}
        </div>
      )}

      {canManage && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {formError && <p className="text-xs text-destructive">{formError}</p>}
          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nome do briefing (ex.: Briefing enviado pelo cliente)"
              disabled={saving}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
            <input
              value={externalUrl}
              onChange={(event) => setExternalUrl(event.target.value)}
              placeholder="URL do arquivo (Drive, Dropbox, etc.)"
              disabled={saving}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          <div className="flex justify-end">
            <Button type="button" variant="secondary" disabled={saving} onClick={() => void handleAttach()}>
              {saving ? 'Anexando...' : 'Anexar briefing'}
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

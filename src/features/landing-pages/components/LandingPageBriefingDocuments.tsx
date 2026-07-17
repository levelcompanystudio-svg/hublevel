import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge, Button, Card } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import {
  createDocument,
  getDocumentFileSignedUrl,
  listDocumentsByClient,
  removeDocumentFile,
  uploadDocumentFile,
} from '../../documents/documents.api';
import { DOCUMENT_FILE_ALLOWED_EXTENSIONS, validateDocumentFile } from '../../documents/documents.types';
import type { Document } from '../../documents/documents.types';
import { StepBadge } from './LandingPageStepBadge';

interface LandingPageBriefingDocumentsProps {
  clientId: string;
  canManage: boolean;
  selectedDocumentId: string | null;
  onSelectReference: (document: Document) => void;
  onCountChange?: (count: number) => void;
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

// Anexo de briefing reaproveita 100% a estrutura de `documents` ja existente (type: 'briefing').
// Arquivos ficam no bucket privado `client-documents`; links externos continuam como alternativa.
export function LandingPageBriefingDocuments({
  clientId,
  canManage,
  selectedDocumentId,
  onSelectReference,
  onCountChange,
}: LandingPageBriefingDocumentsProps) {
  const { profile } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [externalUrl, setExternalUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [openingFileId, setOpeningFileId] = useState<string | null>(null);

  useEffect(() => {
    onCountChange?.(documents.length);
  }, [documents, onCountChange]);

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

    const trimmedTitle = title.trim() || selectedFile?.name.trim() || '';
    const trimmedUrl = externalUrl.trim();

    if (!trimmedTitle) {
      setFormError('Informe um nome para o briefing.');
      return;
    }
    if (!selectedFile && !trimmedUrl) {
      setFormError('Anexe um arquivo ou informe uma URL.');
      return;
    }
    if (trimmedUrl && !/^https?:\/\//i.test(trimmedUrl)) {
      setFormError('Informe uma URL valida iniciada com http:// ou https://');
      return;
    }
    const fileError = selectedFile ? validateDocumentFile(selectedFile) : null;
    if (fileError) {
      setFormError(fileError);
      return;
    }

    let uploadedPath: string | null = null;

    try {
      setSaving(true);
      setFormError(null);
      if (selectedFile) {
        uploadedPath = await uploadDocumentFile(clientId, selectedFile);
      }

      const created = await createDocument(
        {
          client_id: clientId,
          type: 'briefing',
          title: trimmedTitle,
          description: '',
          external_url: trimmedUrl,
          file_url: uploadedPath ?? '',
        },
        profile.id,
      );
      setDocuments((current) => [created, ...current]);
      setTitle('');
      setExternalUrl('');
      setSelectedFile(null);
      setFileInputKey((current) => current + 1);
    } catch (err: unknown) {
      if (uploadedPath) {
        await removeDocumentFile(uploadedPath).catch(() => undefined);
      }
      setFormError(err instanceof Error ? err.message : 'Erro ao anexar briefing.');
    } finally {
      setSaving(false);
    }
  }

  async function handleOpenFile(document: Document) {
    if (!document.file_url) return;

    try {
      setOpeningFileId(document.id);
      const signedUrl = await getDocumentFileSignedUrl(document.file_url);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Erro ao abrir arquivo.');
    } finally {
      setOpeningFileId(null);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StepBadge step={2} />
          <h3 className="text-sm font-semibold text-foreground">Briefings anexados</h3>
        </div>
        <Badge tone="brand">Usado na analise por IA</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Depois de salvar o briefing manual acima, anexe aqui materiais que o cliente ja tenha pronto. O arquivo fica
        salvo nos Documentos do cliente e pode ser escolhido como referencia para a analise por IA logo abaixo.
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
              const isSelected = document.id === selectedDocumentId;
              return (
                <div
                  key={document.id}
                  className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2.5 transition ${
                    isSelected ? 'border-primary/60 bg-primary/5' : 'border-border bg-surface/40'
                  }`}
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
                  <div className="flex shrink-0 items-center gap-2">
                    {document.file_url && <Badge tone="brand">Arquivo</Badge>}
                    {document.external_url && <Badge tone="neutral">Link</Badge>}
                    <Badge tone="neutral">Briefing</Badge>
                    {document.file_url && (
                      <Button
                        type="button"
                        variant="ghost"
                        disabled={openingFileId === document.id}
                        onClick={() => void handleOpenFile(document)}
                      >
                        {openingFileId === document.id ? 'Abrindo...' : 'Abrir'}
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant={isSelected ? 'primary' : 'secondary'}
                      onClick={() => onSelectReference(document)}
                    >
                      {isSelected ? 'Referencia selecionada' : 'Usar como referencia'}
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {canManage && (
        <div className="mt-4 space-y-2 border-t border-border pt-4">
          {formError && <p className="text-xs text-destructive">{formError}</p>}
          <div className="space-y-3">
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nome do briefing (opcional se anexar arquivo)"
              disabled={saving}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
            />
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <input
                  key={fileInputKey}
                  type="file"
                  accept={DOCUMENT_FILE_ALLOWED_EXTENSIONS.map((extension) => `.${extension}`).join(',')}
                  disabled={saving}
                  onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">PDF, DOCX, TXT ou MD ate 20MB.</p>
              </div>
              <div>
                <input
                  value={externalUrl}
                  onChange={(event) => setExternalUrl(event.target.value)}
                  placeholder="Ou cole uma URL (Drive, Dropbox, etc.)"
                  disabled={saving}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                />
                <p className="mt-1 text-[11px] text-muted-foreground">Opcional, como alternativa ao upload.</p>
              </div>
            </div>
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

import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { DocumentClientRef, DocumentFormValues, DocumentType } from '../documents.types';
import { DOCUMENT_FILE_ALLOWED_EXTENSIONS } from '../documents.types';

const typeLabels: Record<DocumentType, string> = {
  contrato: 'Contrato',
  proposta: 'Proposta',
  briefing: 'Briefing',
  relatorio: 'Relatorio',
  planejamento: 'Planejamento',
  comprovante: 'Comprovante',
  outro: 'Outro',
};

interface DocumentFormProps {
  values: DocumentFormValues;
  clients: DocumentClientRef[];
  allowedTypes: DocumentType[];
  loading?: boolean;
  selectedFile: File | null;
  submitLabel: string;
  onChange: (values: DocumentFormValues) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}

export function DocumentForm({
  values,
  clients,
  allowedTypes,
  loading = false,
  selectedFile,
  submitLabel,
  onChange,
  onFileChange,
  onSubmit,
}: DocumentFormProps) {
  function setField<K extends keyof DocumentFormValues>(key: K, value: DocumentFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Cliente" required>
            <select
              required
              value={values.client_id}
              onChange={(event) => setField('client_id', event.target.value)}
              className={inputClassName}
            >
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.trade_name || client.company_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tipo" required>
            <select
              required
              value={values.type}
              onChange={(event) => setField('type', event.target.value as DocumentType)}
              className={inputClassName}
            >
              {allowedTypes.map((type) => (
                <option key={type} value={type}>
                  {typeLabels[type]}
                </option>
              ))}
            </select>
          </Field>

          <div className="lg:col-span-2">
            <Field label="Titulo" required>
              <input
                required
                value={values.title}
                onChange={(event) => setField('title', event.target.value)}
                className={inputClassName}
                placeholder="Ex.: Contrato de prestacao de servicos"
              />
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field label="Arquivo do documento">
              <input
                type="file"
                accept={DOCUMENT_FILE_ALLOWED_EXTENSIONS.map((extension) => `.${extension}`).join(',')}
                disabled={loading}
                onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
                className={inputClassName}
              />
              <p className="mt-2 text-xs text-muted-foreground">
                PDF, DOCX, TXT ou MD ate 20MB. O arquivo fica salvo no HubLevel e vinculado ao cliente.
              </p>
              {selectedFile && <p className="mt-1 text-xs font-medium text-foreground">Selecionado: {selectedFile.name}</p>}
              {values.file_url && !selectedFile && (
                <p className="mt-1 text-xs text-muted-foreground">Este documento ja possui arquivo anexado.</p>
              )}
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field label="URL do documento">
              <input
                type="url"
                value={values.external_url}
                onChange={(event) => setField('external_url', event.target.value)}
                className={inputClassName}
                placeholder="https://..."
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Opcional. Use link quando o arquivo ja estiver no Drive, Dropbox ou outro local.
              </p>
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field label="Descricao">
              <textarea
                value={values.description}
                onChange={(event) => setField('description', event.target.value)}
                className={`${inputClassName} min-h-24 resize-y`}
                placeholder="Contexto sobre o documento"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </Card>
    </form>
  );
}

const inputClassName = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground';

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}

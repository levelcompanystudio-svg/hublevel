import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createDocument, getDocument, listDocumentClients, updateDocument } from '../documents.api';
import { SENSITIVE_DOCUMENT_TYPES, emptyDocumentFormValues, validateDocumentForm } from '../documents.types';
import type { DocumentClientRef, DocumentFormValues, DocumentType } from '../documents.types';
import { DocumentForm } from '../components/DocumentForm';
import { DocumentHeader } from '../components/DocumentHeader';

const ALL_DOCUMENT_TYPES: DocumentType[] = ['contrato', 'proposta', 'briefing', 'relatorio', 'planejamento', 'comprovante', 'outro'];

export function DocumentFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client_id') ?? '';
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [values, setValues] = useState<DocumentFormValues>(emptyDocumentFormValues);
  const [clients, setClients] = useState<DocumentClientRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;
  const editing = Boolean(id);
  const canAccess = role === 'admin' || role === 'gestor';
  // Nenhuma policy de UPDATE existe para Gestor em `documents` (apenas admin gerencia tudo);
  // edicao fica restrita a Admin para nao tentar uma escrita que a RLS sempre rejeitaria.
  const canEdit = role === 'admin';
  const allowedTypes = role === 'admin' ? ALL_DOCUMENT_TYPES : ALL_DOCUMENT_TYPES.filter((type) => !SENSITIVE_DOCUMENT_TYPES.includes(type));

  useEffect(() => {
    if (!profile || !canAccess || (editing && !canEdit)) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadFormData() {
      try {
        setLoading(true);
        setError(null);

        const [clientRows, document] = await Promise.all([
          listDocumentClients(),
          id ? getDocument(id) : Promise.resolve(null),
        ]);

        if (!active) return;

        setClients(clientRows);

        if (document) {
          setValues({
            client_id: document.client_id,
            type: document.type,
            title: document.title,
            description: document.description ?? '',
            external_url: document.external_url ?? '',
          });
        } else {
          setValues({
            ...emptyDocumentFormValues,
            client_id: preselectedClientId,
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao preparar formulario de documento.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFormData();

    return () => {
      active = false;
    };
  }, [canAccess, canEdit, editing, id, preselectedClientId, profile]);

  async function handleSubmit() {
    if (!profile) return;

    const validationError = validateDocumentForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const saved = id
        ? await updateDocument(id, values)
        : await createDocument(values, profile.id);

      navigate(`/app/documentos/${saved.id}`, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar documento.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (!canAccess || (editing && !canEdit)) {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <DocumentHeader
        title={editing ? 'Editar documento' : 'Novo documento'}
        description={editing ? 'Atualize os dados do documento.' : 'Cadastre um novo documento vinculado a um cliente.'}
      />

      {loading && <LoadingState title="Preparando formulario" />}
      {error && <ErrorState description={error} />}
      {!loading && (
        <DocumentForm
          values={values}
          clients={clients}
          allowedTypes={allowedTypes}
          loading={saving}
          submitLabel={editing ? 'Salvar alteracoes' : 'Cadastrar documento'}
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

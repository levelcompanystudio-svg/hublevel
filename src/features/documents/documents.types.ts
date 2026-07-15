export type DocumentType = 'contrato' | 'proposta' | 'briefing' | 'relatorio' | 'planejamento' | 'comprovante' | 'outro';

export const SENSITIVE_DOCUMENT_TYPES: DocumentType[] = ['contrato', 'comprovante'];

export interface DocumentClientRef {
  id: string;
  company_name: string;
  trade_name: string | null;
}

export interface DocumentCreatorRef {
  id: string;
  name: string;
}

export interface Document {
  id: string;
  client_id: string;
  type: DocumentType;
  title: string;
  description: string | null;
  external_url: string | null;
  file_url: string | null;
  created_by_user_id: string;
  created_at: string;
  updated_at: string;
  client?: DocumentClientRef | DocumentClientRef[] | null;
  creator?: DocumentCreatorRef | DocumentCreatorRef[] | null;
}

export interface DocumentFormValues {
  client_id: string;
  type: DocumentType;
  title: string;
  description: string;
  external_url: string;
}

export const emptyDocumentFormValues: DocumentFormValues = {
  client_id: '',
  type: 'outro',
  title: '',
  description: '',
  external_url: '',
};

export function validateDocumentForm(values: DocumentFormValues): string | null {
  if (!values.client_id) return 'Selecione um cliente.';
  if (!values.type) return 'Selecione o tipo do documento.';
  if (!values.title.trim()) return 'Informe um titulo para o documento.';
  if (!values.external_url.trim()) return 'Informe a URL do documento.';
  if (!/^https?:\/\//i.test(values.external_url.trim())) {
    return 'Informe uma URL valida iniciada com http:// ou https://';
  }
  return null;
}

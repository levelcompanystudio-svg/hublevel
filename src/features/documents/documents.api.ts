import { supabase } from '../../lib/supabase';
import type { Document, DocumentClientRef, DocumentCreatorRef, DocumentFormValues } from './documents.types';

const DOCUMENT_BUCKET = 'client-documents';

type DocumentRow = Omit<Document, 'client' | 'creator'> & {
  client?: DocumentClientRef | DocumentClientRef[] | null;
  creator?: DocumentCreatorRef | DocumentCreatorRef[] | null;
};

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function normalizeNullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function mapDocument(row: DocumentRow): Document {
  return {
    ...row,
    client: firstRelation(row.client),
    creator: firstRelation(row.creator),
  };
}

function toDocumentPayload(values: DocumentFormValues) {
  return {
    client_id: values.client_id,
    type: values.type,
    title: values.title.trim(),
    description: normalizeNullable(values.description),
    external_url: normalizeNullable(values.external_url),
    file_url: normalizeNullable(values.file_url),
  };
}

const documentSelect = `
  id,
  client_id,
  type,
  title,
  description,
  external_url,
  file_url,
  created_by_user_id,
  created_at,
  updated_at,
  client:clients!documents_client_id_fkey(id, company_name, trade_name),
  creator:profiles!documents_created_by_user_id_fkey(id, name)
`;

export async function listDocuments(): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select(documentSelect)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as DocumentRow[]).map(mapDocument);
}

export async function listDocumentsByClient(clientId: string): Promise<Document[]> {
  const { data, error } = await supabase
    .from('documents')
    .select(documentSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return ((data ?? []) as DocumentRow[]).map(mapDocument);
}

export async function getDocument(id: string): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .select(documentSelect)
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error('Documento nao encontrado ou sem permissao de acesso.');

  return mapDocument(data as DocumentRow);
}

export async function listDocumentClients(): Promise<DocumentClientRef[]> {
  const { data, error } = await supabase
    .from('clients')
    .select('id, company_name, trade_name')
    .is('deleted_at', null)
    .order('company_name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as DocumentClientRef[];
}

export async function createDocument(values: DocumentFormValues, userId: string): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .insert({
      ...toDocumentPayload(values),
      created_by_user_id: userId,
    })
    .select(documentSelect)
    .single();

  if (error) throw error;
  return mapDocument(data as DocumentRow);
}

export async function updateDocument(id: string, values: DocumentFormValues): Promise<Document> {
  const { data, error } = await supabase
    .from('documents')
    .update(toDocumentPayload(values))
    .eq('id', id)
    .select(documentSelect)
    .single();

  if (error) throw error;
  return mapDocument(data as DocumentRow);
}

function safeFileName(name: string): string {
  const extension = name.split('.').pop()?.toLowerCase();
  const base = name
    .replace(/\.[^.]+$/, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 60);

  return `${base || 'documento'}${extension ? `.${extension}` : ''}`;
}

export async function uploadDocumentFile(clientId: string, file: File): Promise<string> {
  const path = `${clientId}/${crypto.randomUUID()}-${safeFileName(file.name)}`;
  const { error } = await supabase.storage.from(DOCUMENT_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) throw error;
  return path;
}

export async function removeDocumentFile(path: string): Promise<void> {
  const { error } = await supabase.storage.from(DOCUMENT_BUCKET).remove([path]);
  if (error) throw error;
}

export async function getDocumentFileSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(DOCUMENT_BUCKET).createSignedUrl(path, 60 * 10);
  if (error) throw error;
  return data.signedUrl;
}

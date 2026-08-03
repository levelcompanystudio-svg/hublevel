import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui';
import { createCrmContact, updateCrmContact } from '../crm.api';
import type { CrmContact } from '../crm.types';

interface CrmContactFormProps {
  clientId: string;
  contact: CrmContact | null;
  userId: string;
  onClose: () => void;
  onSaved: (contact: CrmContact) => void;
}

interface ContactFormValues {
  name: string;
  email: string;
  phone: string;
  company_name: string;
  position: string;
  notes: string;
}

const emptyValues: ContactFormValues = { name: '', email: '', phone: '', company_name: '', position: '', notes: '' };

function toFormValues(contact: CrmContact | null): ContactFormValues {
  if (!contact) return emptyValues;
  return {
    name: contact.name,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    company_name: contact.company_name ?? '',
    position: contact.position ?? '',
    notes: contact.notes ?? '',
  };
}

function normalize(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const inputClassName =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground';

// Drawer de criacao/edicao de contato. Sem delete nesta etapa.
export function CrmContactForm({ clientId, contact, userId, onClose, onSaved }: CrmContactFormProps) {
  const [values, setValues] = useState<ContactFormValues>(() => toFormValues(contact));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = contact !== null;

  useEffect(() => {
    setValues(toFormValues(contact));
    setError(null);
  }, [contact]);

  function setField<K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.name.trim()) {
      setError('Informe o nome do contato.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        name: values.name.trim(),
        email: normalize(values.email),
        phone: normalize(values.phone),
        company_name: normalize(values.company_name),
        position: normalize(values.position),
        notes: normalize(values.notes),
      };
      const saved = isEdit && contact
        ? await updateCrmContact(contact.id, payload, userId)
        : await createCrmContact({ client_id: clientId, ...payload }, userId);
      onSaved(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar o contato.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Fechar" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-soft">
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{isEdit ? 'Editar contato' : 'Novo contato'}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isEdit ? 'Atualize os dados deste contato.' : 'Cadastre um contato para este cliente.'}
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Fechar
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Nome">
              <input
                value={values.name}
                onChange={(event) => setField('name', event.target.value)}
                disabled={saving}
                className={inputClassName}
                placeholder="Nome do contato"
                required
              />
            </Field>
            <Field label="E-mail">
              <input
                type="email"
                value={values.email}
                onChange={(event) => setField('email', event.target.value)}
                disabled={saving}
                className={inputClassName}
                placeholder="email@empresa.com"
              />
            </Field>
            <Field label="Telefone">
              <input
                value={values.phone}
                onChange={(event) => setField('phone', event.target.value)}
                disabled={saving}
                className={inputClassName}
                placeholder="(00) 00000-0000"
              />
            </Field>
            <Field label="Empresa">
              <input
                value={values.company_name}
                onChange={(event) => setField('company_name', event.target.value)}
                disabled={saving}
                className={inputClassName}
                placeholder="Nome da empresa"
              />
            </Field>
            <Field label="Cargo">
              <input
                value={values.position}
                onChange={(event) => setField('position', event.target.value)}
                disabled={saving}
                className={inputClassName}
                placeholder="Cargo do contato"
              />
            </Field>
            <Field label="Observacoes">
              <textarea
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                disabled={saving}
                rows={3}
                className={inputClassName}
                placeholder="Notas internas sobre o contato"
              />
            </Field>

            {error && <ErrorState description={error} />}

            <Button type="submit" variant="primary" disabled={saving} className="w-full">
              {saving ? 'Salvando...' : isEdit ? 'Salvar alteracoes' : 'Criar contato'}
            </Button>
          </form>
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

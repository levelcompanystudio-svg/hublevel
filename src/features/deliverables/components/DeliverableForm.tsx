import type { FormEvent, ReactNode } from 'react';
import { Button, Card } from '../../../components/ui';
import type { DeliverableClient, DeliverableFormValues, DeliverableProfile } from '../deliverables.types';

interface DeliverableFormProps {
  values: DeliverableFormValues;
  clients: DeliverableClient[];
  assignees: DeliverableProfile[];
  loading?: boolean;
  submitLabel: string;
  onChange: (values: DeliverableFormValues) => void;
  onSubmit: () => void;
}

export function DeliverableForm({ values, clients, assignees, loading = false, submitLabel, onChange, onSubmit }: DeliverableFormProps) {
  function setField<K extends keyof DeliverableFormValues>(key: K, value: DeliverableFormValues[K]) {
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
          <Field label="Titulo" required>
            <input required value={values.title} onChange={(event) => setField('title', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Cliente" required>
            <select required value={values.client_id} onChange={(event) => setField('client_id', event.target.value)} className={inputClassName}>
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.trade_name || client.company_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Responsavel">
            <select value={values.assigned_to} onChange={(event) => setField('assigned_to', event.target.value)} className={inputClassName}>
              <option value="">Sem responsavel</option>
              {assignees.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade">
            <select value={values.priority} onChange={(event) => setField('priority', event.target.value as DeliverableFormValues['priority'])} className={inputClassName}>
              <option value="low">Baixa</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
              <option value="urgent">Urgente</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={values.status} onChange={(event) => setField('status', event.target.value as DeliverableFormValues['status'])} className={inputClassName}>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em andamento</option>
              <option value="delivered">Entregue</option>
              <option value="approved">Aprovado</option>
              <option value="overdue">Atrasado</option>
              <option value="canceled">Cancelado</option>
            </select>
          </Field>
          <Field label="Prazo">
            <input type="date" value={values.due_date} onChange={(event) => setField('due_date', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Mes de referencia">
            <input type="date" value={values.reference_month} onChange={(event) => setField('reference_month', event.target.value)} className={inputClassName} />
          </Field>
          <div className="lg:col-span-2">
            <Field label="Descricao">
              <textarea value={values.description} onChange={(event) => setField('description', event.target.value)} className={`${inputClassName} min-h-24 resize-y`} />
            </Field>
          </div>
          <div className="lg:col-span-2">
            <Field label="Observacoes">
              <textarea value={values.notes} onChange={(event) => setField('notes', event.target.value)} className={`${inputClassName} min-h-24 resize-y`} />
            </Field>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Salvando...' : submitLabel}</Button>
        </div>
      </Card>
    </form>
  );
}

const inputClassName = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground';

function Field({ label, required = false, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">{label}{required ? ' *' : ''}</span>
      {children}
    </label>
  );
}

import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { TaskClient, TaskFormValues, TaskProfile } from '../tasks.types';

interface TaskFormProps {
  values: TaskFormValues;
  clients: TaskClient[];
  assignees: TaskProfile[];
  loading?: boolean;
  submitLabel: string;
  onChange: (values: TaskFormValues) => void;
  onSubmit: () => void;
}

export function TaskForm({ values, clients, assignees, loading = false, submitLabel, onChange, onSubmit }: TaskFormProps) {
  function setField<K extends keyof TaskFormValues>(key: K, value: TaskFormValues[K]) {
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
          <Field label="Cliente">
            <select value={values.client_id} onChange={(event) => setField('client_id', event.target.value)} className={inputClassName}>
              <option value="">Sem cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.trade_name || client.company_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Responsavel">
            <select value={values.assigned_to_user_id} onChange={(event) => setField('assigned_to_user_id', event.target.value)} className={inputClassName}>
              <option value="">Sem responsavel</option>
              {assignees.map((profile) => (
                <option key={profile.id} value={profile.id}>{profile.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Prioridade">
            <select value={values.priority} onChange={(event) => setField('priority', event.target.value as TaskFormValues['priority'])} className={inputClassName}>
              <option value="baixa">Baixa</option>
              <option value="media">Media</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
          </Field>
          <Field label="Status">
            <select value={values.status} onChange={(event) => setField('status', event.target.value as TaskFormValues['status'])} className={inputClassName}>
              <option value="a_fazer">Pendente</option>
              <option value="em_andamento">Em andamento</option>
              <option value="aguardando_cliente">Aguardando cliente</option>
              <option value="em_revisao">Em revisao</option>
              <option value="concluida">Concluida</option>
              <option value="cancelada">Cancelada</option>
            </select>
          </Field>
          <Field label="Prazo">
            <input type="date" value={values.due_date} onChange={(event) => setField('due_date', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Categoria">
            <input value={values.category} onChange={(event) => setField('category', event.target.value)} className={inputClassName} />
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

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">{label}{required ? ' *' : ''}</span>
      {children}
    </label>
  );
}

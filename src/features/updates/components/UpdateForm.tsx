import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { UpdateClientRef, UpdateFormValues, UpdateResponsibleRef } from '../updates.types';

interface UpdateFormProps {
  values: UpdateFormValues;
  clients: UpdateClientRef[];
  responsibles: UpdateResponsibleRef[];
  canChooseResponsible: boolean;
  canChooseClient?: boolean;
  loading?: boolean;
  submitLabel: string;
  onChange: (values: UpdateFormValues) => void;
  onSubmit: () => void;
}

export function UpdateForm({
  values,
  clients,
  responsibles,
  canChooseResponsible,
  canChooseClient = true,
  loading = false,
  submitLabel,
  onChange,
  onSubmit,
}: UpdateFormProps) {
  function setField<K extends keyof UpdateFormValues>(key: K, value: UpdateFormValues[K]) {
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
              disabled={!canChooseClient}
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

          <Field label="Responsavel" required>
            <select
              required
              value={values.responsible_user_id}
              disabled={!canChooseResponsible}
              onChange={(event) => setField('responsible_user_id', event.target.value)}
              className={inputClassName}
            >
              <option value="">Selecione um responsavel</option>
              {responsibles.map((responsible) => (
                <option key={responsible.id} value={responsible.id}>
                  {responsible.name}
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
                placeholder="Resumo curto da atualizacao"
              />
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field label="Descricao" required>
              <textarea
                required
                value={values.description}
                onChange={(event) => setField('description', event.target.value)}
                className={`${inputClassName} min-h-28 resize-y`}
                placeholder="Detalhe o que foi feito ou observado nesta atualizacao"
              />
            </Field>
          </div>

          <Field label="Categoria">
            <input
              value={values.category}
              onChange={(event) => setField('category', event.target.value)}
              className={inputClassName}
              placeholder="Ex.: Estrategia, criativo, otimizacao"
            />
          </Field>

          <Field label="Status">
            <select
              value={values.status}
              onChange={(event) => setField('status', event.target.value as UpdateFormValues['status'])}
              className={inputClassName}
            >
              <option value="rascunho">Rascunho</option>
              <option value="registrada">Registrada</option>
              <option value="enviada">Enviada</option>
            </select>
          </Field>

          <Field label="Data da atualizacao" required>
            <input
              required
              type="date"
              value={values.update_date}
              onChange={(event) => setField('update_date', event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Enviado ao cliente">
            <label className="flex h-[38px] items-center gap-2 rounded-md border border-border bg-background px-3 text-sm text-foreground">
              <input
                type="checkbox"
                checked={values.sent_to_client}
                onChange={(event) => setField('sent_to_client', event.target.checked)}
                className="h-4 w-4 rounded border-border accent-primary"
              />
              Atualizacao enviada ao cliente
            </label>
          </Field>

          <div className="lg:col-span-2">
            <Field label="Proxima acao">
              <textarea
                value={values.next_action}
                onChange={(event) => setField('next_action', event.target.value)}
                className={`${inputClassName} min-h-20 resize-y`}
                placeholder="Proximo passo combinado ou planejado para o cliente"
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

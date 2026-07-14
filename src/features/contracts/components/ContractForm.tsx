import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { ContractClient, ContractFormValues } from '../contracts.types';

interface ContractFormProps {
  values: ContractFormValues;
  clients: ContractClient[];
  loading?: boolean;
  submitLabel: string;
  onChange: (values: ContractFormValues) => void;
  onSubmit: () => void;
}

export function ContractForm({ values, clients, loading = false, submitLabel, onChange, onSubmit }: ContractFormProps) {
  function setField<K extends keyof ContractFormValues>(key: K, value: ContractFormValues[K]) {
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

          <Field label="Status" required>
            <select
              required
              value={values.status}
              onChange={(event) => setField('status', event.target.value as ContractFormValues['status'])}
              className={inputClassName}
            >
              <option value="pendente">Pendente</option>
              <option value="ativo">Ativo</option>
              <option value="vencido">Vencido</option>
              <option value="encerrado">Encerrado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </Field>

          <Field label="Data de inicio" required>
            <input
              required
              type="date"
              value={values.start_date}
              onChange={(event) => setField('start_date', event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Data de encerramento">
            <input
              type="date"
              value={values.end_date}
              onChange={(event) => setField('end_date', event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Valor mensal" required>
            <input
              required
              type="number"
              min="0"
              step="0.01"
              value={values.monthly_value}
              onChange={(event) => setField('monthly_value', event.target.value)}
              className={inputClassName}
              placeholder="0.00"
            />
          </Field>

          <Field label="Dia de cobranca" required>
            <input
              required
              type="number"
              min="1"
              max="31"
              step="1"
              value={values.billing_day}
              onChange={(event) => setField('billing_day', event.target.value)}
              className={inputClassName}
              placeholder="1 a 31"
            />
          </Field>

          <Field label="Prazo de aviso previo (dias)">
            <input
              type="number"
              min="0"
              step="1"
              value={values.notice_period_days}
              onChange={(event) => setField('notice_period_days', event.target.value)}
              className={inputClassName}
              placeholder="Opcional"
            />
          </Field>

          <div className="lg:col-span-2">
            <Field label="Observacoes">
              <textarea
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                className={`${inputClassName} min-h-24 resize-y`}
                placeholder="Contexto administrativo do contrato"
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

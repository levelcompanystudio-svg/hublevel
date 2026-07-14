import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { ServiceFormValues } from '../services.types';

interface ServiceFormProps {
  values: ServiceFormValues;
  loading?: boolean;
  submitLabel: string;
  onChange: (values: ServiceFormValues) => void;
  onSubmit: () => void;
}

export function ServiceForm({
  values,
  loading = false,
  submitLabel,
  onChange,
  onSubmit,
}: ServiceFormProps) {
  function setField<K extends keyof ServiceFormValues>(key: K, value: ServiceFormValues[K]) {
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
          <Field label="Nome" required>
            <input
              required
              value={values.name}
              onChange={(event) => setField('name', event.target.value)}
              className={inputClassName}
              placeholder="Ex.: Gestao de trafego"
            />
          </Field>

          <Field label="Categoria">
            <input
              value={values.category}
              onChange={(event) => setField('category', event.target.value)}
              className={inputClassName}
              placeholder="Ex.: Marketing, consultoria, criativo"
            />
          </Field>

          <Field label="Preco padrao">
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.default_price}
              onChange={(event) => setField('default_price', event.target.value)}
              className={inputClassName}
              placeholder="0.00"
            />
          </Field>

          <Field label="Ciclo de cobranca">
            <select
              value={values.billing_cycle}
              onChange={(event) => setField('billing_cycle', event.target.value as ServiceFormValues['billing_cycle'])}
              className={inputClassName}
            >
              <option value="">Sem ciclo</option>
              <option value="one_time">Unico</option>
              <option value="monthly">Mensal</option>
              <option value="quarterly">Trimestral</option>
              <option value="yearly">Anual</option>
            </select>
          </Field>

          <Field label="Status">
            <select
              value={values.status}
              onChange={(event) => setField('status', event.target.value as ServiceFormValues['status'])}
              className={inputClassName}
            >
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
            </select>
          </Field>

          <div className="lg:col-span-2">
            <Field label="Descricao">
              <textarea
                value={values.description}
                onChange={(event) => setField('description', event.target.value)}
                className={`${inputClassName} min-h-24 resize-y`}
                placeholder="Descreva o escopo basico do servico"
              />
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field label="Observacoes">
              <textarea
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                className={`${inputClassName} min-h-24 resize-y`}
                placeholder="Observacoes internas sobre entrega, variacoes ou uso em contratos"
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

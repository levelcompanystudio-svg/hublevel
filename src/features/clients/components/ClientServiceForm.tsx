import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { ClientServiceFormValues } from '../client-services.types';
import type { Service } from '../../services/services.types';

interface ClientServiceFormProps {
  values: ClientServiceFormValues;
  catalog: Service[];
  editing: boolean;
  loading?: boolean;
  onChange: (values: ClientServiceFormValues) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export function ClientServiceForm({
  values,
  catalog,
  editing,
  loading = false,
  onChange,
  onSubmit,
  onCancel,
}: ClientServiceFormProps) {
  function setField<K extends keyof ClientServiceFormValues>(key: K, value: ClientServiceFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function handleServiceChange(serviceId: string) {
    const selected = catalog.find((service) => service.id === serviceId);
    const suggestedPrice =
      selected && selected.default_price !== null && values.monthly_value.trim() === ''
        ? String(selected.default_price)
        : values.monthly_value;

    onChange({ ...values, service_id: serviceId, monthly_value: suggestedPrice });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h3 className="text-sm font-semibold text-foreground">
          {editing ? 'Editar servico contratado' : 'Adicionar servico contratado'}
        </h3>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Servico" required>
            <select
              required
              value={values.service_id}
              onChange={(event) => handleServiceChange(event.target.value)}
              className={inputClassName}
            >
              <option value="">Selecione um servico do catalogo</option>
              {catalog.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Status" required>
            <select
              required
              value={values.status}
              onChange={(event) => setField('status', event.target.value as ClientServiceFormValues['status'])}
              className={inputClassName}
            >
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </Field>

          <Field label="Valor mensal">
            <input
              type="number"
              min="0"
              step="0.01"
              value={values.monthly_value}
              onChange={(event) => setField('monthly_value', event.target.value)}
              className={inputClassName}
              placeholder="Sugerido pelo catalogo"
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Inicio">
              <input
                type="date"
                value={values.start_date}
                onChange={(event) => setField('start_date', event.target.value)}
                className={inputClassName}
              />
            </Field>
            <Field label="Fim">
              <input
                type="date"
                value={values.end_date}
                onChange={(event) => setField('end_date', event.target.value)}
                className={inputClassName}
              />
            </Field>
          </div>

          <div className="sm:col-span-2">
            <Field label="Observacoes">
              <textarea
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                className={`${inputClassName} min-h-20 resize-y`}
                placeholder="Contexto do vinculo com este cliente"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Salvando...' : editing ? 'Salvar alteracoes' : 'Adicionar servico'}
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

import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { FinanceClient, FinancialRecordFormValues } from '../finance.types';

interface FinanceFormProps {
  values: FinancialRecordFormValues;
  clients: FinanceClient[];
  loading?: boolean;
  submitLabel: string;
  onChange: (values: FinancialRecordFormValues) => void;
  onSubmit: () => void;
}

export function FinanceForm({ values, clients, loading = false, submitLabel, onChange, onSubmit }: FinanceFormProps) {
  function setField<K extends keyof FinancialRecordFormValues>(key: K, value: FinancialRecordFormValues[K]) {
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
            <select required value={values.client_id} onChange={(event) => setField('client_id', event.target.value)} className={inputClassName}>
              <option value="">Selecione um cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>{client.trade_name || client.company_name}</option>
              ))}
            </select>
          </Field>
          <Field label="Competencia" required>
            <input required type="month" value={values.competence_month} onChange={(event) => setField('competence_month', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Valor" required>
            <input required type="number" min="0" step="0.01" value={values.amount} onChange={(event) => setField('amount', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Vencimento" required>
            <input required type="date" value={values.due_date} onChange={(event) => setField('due_date', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Status">
            <select value={values.status} onChange={(event) => setField('status', event.target.value as FinancialRecordFormValues['status'])} className={inputClassName}>
              <option value="previsto">Previsto</option>
              <option value="pago">Pago</option>
              <option value="atrasado">Atrasado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </Field>
          <Field label="Descricao">
            <input value={values.description} onChange={(event) => setField('description', event.target.value)} className={inputClassName} placeholder="Descricao do lancamento" />
          </Field>
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

const inputClassName = 'w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-500';

function Field({ label, required = false, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">{label}{required ? ' *' : ''}</span>
      {children}
    </label>
  );
}

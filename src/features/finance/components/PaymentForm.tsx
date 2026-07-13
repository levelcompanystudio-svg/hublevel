import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { PaymentFormValues } from '../finance.types';

interface PaymentFormProps {
  values: PaymentFormValues;
  loading?: boolean;
  onChange: (values: PaymentFormValues) => void;
  onSubmit: () => void;
}

export function PaymentForm({ values, loading = false, onChange, onSubmit }: PaymentFormProps) {
  function setField<K extends keyof PaymentFormValues>(key: K, value: PaymentFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h3 className="text-sm font-semibold text-slate-100">Registrar pagamento</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Field label="Valor" required>
            <input required type="number" min="0.01" step="0.01" value={values.amount} onChange={(event) => setField('amount', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Pago em" required>
            <input required type="datetime-local" value={values.paid_at} onChange={(event) => setField('paid_at', event.target.value)} className={inputClassName} />
          </Field>
          <Field label="Metodo">
            <select value={values.method} onChange={(event) => setField('method', event.target.value as PaymentFormValues['method'])} className={inputClassName}>
              <option value="">Sem metodo</option>
              <option value="pix">Pix</option>
              <option value="boleto">Boleto</option>
              <option value="cartao">Cartao</option>
              <option value="transferencia">Transferencia</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="outro">Outro</option>
            </select>
          </Field>
          <Field label="Observacoes">
            <input value={values.notes} onChange={(event) => setField('notes', event.target.value)} className={inputClassName} />
          </Field>
        </div>
        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Registrando...' : 'Registrar pagamento'}</Button>
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

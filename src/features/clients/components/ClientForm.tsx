import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { ClientFormValues, ResponsibleProfile } from '../clients.types';

interface ClientFormProps {
  values: ClientFormValues;
  responsibleProfiles: ResponsibleProfile[];
  canChooseResponsible: boolean;
  loading?: boolean;
  submitLabel: string;
  onChange: (values: ClientFormValues) => void;
  onSubmit: () => void;
}

export function ClientForm({
  values,
  responsibleProfiles,
  canChooseResponsible,
  loading = false,
  submitLabel,
  onChange,
  onSubmit,
}: ClientFormProps) {
  function setField<K extends keyof ClientFormValues>(key: K, value: ClientFormValues[K]) {
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
          <Field label="Razao social" required>
            <input
              required
              value={values.company_name}
              onChange={(event) => setField('company_name', event.target.value)}
              className={inputClassName}
              placeholder="Nome juridico do cliente"
            />
          </Field>

          <Field label="Nome fantasia">
            <input
              value={values.trade_name}
              onChange={(event) => setField('trade_name', event.target.value)}
              className={inputClassName}
              placeholder="Nome comercial"
            />
          </Field>

          <Field label="Documento">
            <input
              value={values.document_number}
              onChange={(event) => setField('document_number', event.target.value)}
              className={inputClassName}
              placeholder="CNPJ, CPF ou identificador"
            />
          </Field>

          <Field label="Segmento">
            <input
              value={values.segment}
              onChange={(event) => setField('segment', event.target.value)}
              className={inputClassName}
              placeholder="Ex.: Clinica, escola, ecommerce"
            />
          </Field>

          <Field label="Status">
            <select
              value={values.status}
              onChange={(event) => setField('status', event.target.value as ClientFormValues['status'])}
              className={inputClassName}
            >
              <option value="onboarding">Onboarding</option>
              <option value="ativo">Ativo</option>
              <option value="pausado">Pausado</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </Field>

          <Field label="Saude do cliente">
            <select
              value={values.health_status}
              onChange={(event) => setField('health_status', event.target.value as ClientFormValues['health_status'])}
              className={inputClassName}
            >
              <option value="saudavel">Saudavel</option>
              <option value="atencao">Atencao</option>
              <option value="critico">Critico</option>
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
              {responsibleProfiles.map((responsible) => (
                <option key={responsible.id} value={responsible.id}>
                  {responsible.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Data de inicio">
              <input
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
          </div>

          <div className="lg:col-span-2">
            <Field label="Observacoes">
              <textarea
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                className={`${inputClassName} min-h-28 resize-y`}
                placeholder="Contexto operacional inicial do cliente"
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

const inputClassName = 'w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-900 disabled:text-slate-500';

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
      <span className="mb-2 block text-xs font-semibold uppercase text-slate-500">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}

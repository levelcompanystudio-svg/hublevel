import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui';
import { createCrmOpportunity, updateCrmOpportunity } from '../crm.api';
import type { CrmContact, CrmOpportunity, CrmOpportunityStatus, CrmPipelineStage } from '../crm.types';
import { CRM_OPPORTUNITY_STATUS_OPTIONS } from './CrmOpportunityStatusBadge';

interface CrmOpportunityFormProps {
  clientId: string;
  pipelineId: string;
  stages: CrmPipelineStage[];
  contacts: CrmContact[];
  opportunity: CrmOpportunity | null;
  userId: string;
  onClose: () => void;
  onSaved: (opportunity: CrmOpportunity) => void;
}

interface OpportunityFormValues {
  title: string;
  stage_id: string;
  contact_id: string;
  value: string;
  status: CrmOpportunityStatus;
  source: string;
  expected_close_date: string;
  notes: string;
}

function toFormValues(opportunity: CrmOpportunity | null, defaultStageId: string): OpportunityFormValues {
  if (!opportunity) {
    return {
      title: '',
      stage_id: defaultStageId,
      contact_id: '',
      value: '',
      status: 'open',
      source: '',
      expected_close_date: '',
      notes: '',
    };
  }
  return {
    title: opportunity.title,
    stage_id: opportunity.stage_id,
    contact_id: opportunity.contact_id ?? '',
    value: opportunity.value !== null ? String(opportunity.value) : '',
    status: opportunity.status,
    source: opportunity.source ?? '',
    expected_close_date: opportunity.expected_close_date ?? '',
    notes: opportunity.notes ?? '',
  };
}

function normalize(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const inputClassName =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground';

// Drawer de criacao/edicao de oportunidade. Sem responsavel, drag-and-drop ou delete nesta etapa.
export function CrmOpportunityForm({ clientId, pipelineId, stages, contacts, opportunity, userId, onClose, onSaved }: CrmOpportunityFormProps) {
  const defaultStageId = stages[0]?.id ?? '';
  const [values, setValues] = useState<OpportunityFormValues>(() => toFormValues(opportunity, defaultStageId));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isEdit = opportunity !== null;

  useEffect(() => {
    setValues(toFormValues(opportunity, defaultStageId));
    setError(null);
  }, [opportunity, defaultStageId]);

  function setField<K extends keyof OpportunityFormValues>(key: K, value: OpportunityFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.title.trim()) {
      setError('Informe o titulo da oportunidade.');
      return;
    }
    if (!values.stage_id) {
      setError('Selecione a etapa da oportunidade.');
      return;
    }

    let numericValue: number | null = null;
    if (values.value.trim() !== '') {
      numericValue = Number(values.value.replace(',', '.'));
      if (Number.isNaN(numericValue) || numericValue < 0) {
        setError('Informe um valor numerico valido para a oportunidade.');
        return;
      }
    }

    try {
      setSaving(true);
      setError(null);
      const payload = {
        title: values.title.trim(),
        stage_id: values.stage_id,
        contact_id: values.contact_id || null,
        value: numericValue,
        status: values.status,
        source: normalize(values.source),
        expected_close_date: values.expected_close_date || null,
        notes: normalize(values.notes),
      };
      const saved = isEdit && opportunity
        ? await updateCrmOpportunity(opportunity.id, payload, userId)
        : await createCrmOpportunity({ client_id: clientId, pipeline_id: pipelineId, ...payload }, userId);
      onSaved(saved);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar a oportunidade.');
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
            <p className="text-sm font-semibold text-foreground">{isEdit ? 'Editar oportunidade' : 'Nova oportunidade'}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isEdit ? 'Atualize os dados desta oportunidade.' : 'Cadastre uma oportunidade neste pipeline.'}
            </p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Fechar
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Titulo">
              <input
                value={values.title}
                onChange={(event) => setField('title', event.target.value)}
                disabled={saving}
                className={inputClassName}
                placeholder="Ex.: Plano anual - Marketing"
                required
              />
            </Field>
            <Field label="Etapa">
              <select
                value={values.stage_id}
                onChange={(event) => setField('stage_id', event.target.value)}
                disabled={saving}
                className={inputClassName}
                required
              >
                {stages.map((stage) => (
                  <option key={stage.id} value={stage.id}>
                    {stage.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Contato">
              <select
                value={values.contact_id}
                onChange={(event) => setField('contact_id', event.target.value)}
                disabled={saving}
                className={inputClassName}
              >
                <option value="">Sem contato</option>
                {contacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Valor (R$)">
              <input
                inputMode="decimal"
                value={values.value}
                onChange={(event) => setField('value', event.target.value)}
                disabled={saving}
                className={inputClassName}
                placeholder="0,00"
              />
            </Field>
            <Field label="Status">
              <select
                value={values.status}
                onChange={(event) => setField('status', event.target.value as CrmOpportunityStatus)}
                disabled={saving}
                className={inputClassName}
              >
                {CRM_OPPORTUNITY_STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Origem">
              <input
                value={values.source}
                onChange={(event) => setField('source', event.target.value)}
                disabled={saving}
                className={inputClassName}
                placeholder="Ex.: Indicacao, Meta Ads, site"
              />
            </Field>
            <Field label="Previsao de fechamento">
              <input
                type="date"
                value={values.expected_close_date}
                onChange={(event) => setField('expected_close_date', event.target.value)}
                disabled={saving}
                className={inputClassName}
              />
            </Field>
            <Field label="Observacoes">
              <textarea
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                disabled={saving}
                rows={3}
                className={inputClassName}
                placeholder="Notas internas sobre a oportunidade"
              />
            </Field>

            {error && <ErrorState description={error} />}

            <Button type="submit" variant="primary" disabled={saving} className="w-full">
              {saving ? 'Salvando...' : isEdit ? 'Salvar alteracoes' : 'Criar oportunidade'}
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

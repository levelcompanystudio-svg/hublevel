import type { ReactNode } from 'react';
import { Badge, Button, Card } from '../../../components/ui';
import type { LandingPageBriefingValues, LandingPageStatus } from '../landing-page.types';
import { StepBadge } from './LandingPageStepBadge';

interface LandingPageBriefingFormProps {
  values: LandingPageBriefingValues;
  status: LandingPageStatus | null;
  saving: boolean;
  onChange: (values: LandingPageBriefingValues) => void;
  onSubmit: () => void;
}

const statusLabels: Record<LandingPageStatus, string> = {
  draft: 'Rascunho',
  ready: 'Pronto',
  published: 'Publicado',
  archived: 'Arquivado',
};

export function LandingPageBriefingForm({ values, status, saving, onChange, onSubmit }: LandingPageBriefingFormProps) {
  function setField<K extends keyof LandingPageBriefingValues>(key: K, value: LandingPageBriefingValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StepBadge step={1} />
          <h3 className="text-sm font-semibold text-foreground">Briefing da landing page</h3>
        </div>
        <Badge tone={status === 'published' ? 'success' : 'warning'}>{statusLabels[status ?? 'draft']}</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Ponto de partida do fluxo: preencha e salve o briefing manual. Depois voce podera anexar materiais do
        cliente, pedir uma analise por IA e gerar um rascunho de conteudo - tudo com base no que for salvo aqui.
      </p>

      <div className="mt-6 space-y-6">
        <Section title="Identidade">
          <Field label="Nome exibido">
            <input
              value={values.displayName}
              onChange={(event) => setField('displayName', event.target.value)}
              className={inputClassName}
              placeholder="Nome comercial exibido na LP"
            />
          </Field>
          <Field label="Razao social">
            <input
              value={values.legalName}
              onChange={(event) => setField('legalName', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Segmento">
            <input
              value={values.segment}
              onChange={(event) => setField('segment', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Cidade">
            <input
              value={values.city}
              onChange={(event) => setField('city', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Estado">
            <input
              value={values.state}
              onChange={(event) => setField('state', event.target.value)}
              className={inputClassName}
              placeholder="UF"
            />
          </Field>
        </Section>

        <Section title="Oferta">
          <div className="sm:col-span-2">
            <Field label="Headline">
              <input
                value={values.headline}
                onChange={(event) => setField('headline', event.target.value)}
                className={inputClassName}
                placeholder="Frase de impacto principal"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Subheadline">
              <input
                value={values.subheadline}
                onChange={(event) => setField('subheadline', event.target.value)}
                className={inputClassName}
                placeholder="Complemento da headline"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Descricao da oferta">
              <textarea
                value={values.offerDescription}
                onChange={(event) => setField('offerDescription', event.target.value)}
                className={`${inputClassName} min-h-24 resize-y`}
              />
            </Field>
          </div>
        </Section>

        <Section title="Contato e chamada para acao">
          <Field label="WhatsApp">
            <input
              value={values.whatsapp}
              onChange={(event) => setField('whatsapp', event.target.value)}
              className={inputClassName}
              placeholder="(DDD) 00000-0000"
            />
          </Field>
          <Field label="E-mail de contato">
            <input
              type="email"
              value={values.contactEmail}
              onChange={(event) => setField('contactEmail', event.target.value)}
              className={inputClassName}
              placeholder="contato@cliente.com"
            />
          </Field>
          <Field label="CTA principal">
            <input
              value={values.mainCta}
              onChange={(event) => setField('mainCta', event.target.value)}
              className={inputClassName}
              placeholder="Ex.: Falar no WhatsApp, Agendar diagnostico"
            />
          </Field>
        </Section>

        <Section title="Identidade visual">
          <Field label="Cor primaria">
            <input
              value={values.primaryColor}
              onChange={(event) => setField('primaryColor', event.target.value)}
              className={inputClassName}
              placeholder="#7C3AED"
            />
          </Field>
          <Field label="Cor secundaria">
            <input
              value={values.secondaryColor}
              onChange={(event) => setField('secondaryColor', event.target.value)}
              className={inputClassName}
              placeholder="#111827"
            />
          </Field>
          <Field label="URL do logo">
            <input
              value={values.logoUrl}
              onChange={(event) => setField('logoUrl', event.target.value)}
              className={inputClassName}
              placeholder="https://..."
            />
          </Field>
          <Field label="URL da imagem hero">
            <input
              value={values.heroImageUrl}
              onChange={(event) => setField('heroImageUrl', event.target.value)}
              className={inputClassName}
              placeholder="https://..."
            />
          </Field>
        </Section>

        <Section title="FAQ e observacoes">
          <div className="sm:col-span-2">
            <Field label="FAQ / duvidas frequentes">
              <textarea
                value={values.faq}
                onChange={(event) => setField('faq', event.target.value)}
                className={`${inputClassName} min-h-24 resize-y`}
                placeholder="Uma pergunta/resposta por linha"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Observacoes">
              <textarea
                value={values.observations}
                onChange={(event) => setField('observations', event.target.value)}
                className={`${inputClassName} min-h-20 resize-y`}
                placeholder="Contexto adicional para quem for montar a LP"
              />
            </Field>
          </div>
        </Section>
      </div>

      <div className="mt-6 flex justify-end border-t border-border pt-5">
        <Button type="button" variant="primary" disabled={saving} onClick={onSubmit}>
          {saving ? 'Salvando...' : 'Salvar briefing'}
        </Button>
      </div>
    </Card>
  );
}

const inputClassName = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-border pt-5 first:border-t-0 first:pt-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
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

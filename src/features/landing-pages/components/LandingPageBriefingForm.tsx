import { Badge, Card } from '../../../components/ui';
import type { LandingPageBriefingValues } from '../landing-page.types';

interface LandingPageBriefingFormProps {
  values: LandingPageBriefingValues;
  onChange: (values: LandingPageBriefingValues) => void;
}

export function LandingPageBriefingForm({ values, onChange }: LandingPageBriefingFormProps) {
  function setField<K extends keyof LandingPageBriefingValues>(key: K, value: LandingPageBriefingValues[K]) {
    onChange({ ...values, [key]: value });
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Briefing da landing page</h3>
        <Badge tone="warning">Rascunho local</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Esta estrutura ainda nao salva no banco. Os campos abaixo ficam apenas nesta tela, na sua sessao atual, e sao
        perdidos ao trocar de aba ou recarregar a pagina. Geracao por IA e publicacao serao implementadas futuramente.
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
            <Field label="Tagline / slogan">
              <input
                value={values.tagline}
                onChange={(event) => setField('tagline', event.target.value)}
                className={inputClassName}
                placeholder="Frase de impacto principal"
              />
            </Field>
          </div>
          <Field label="Oferta principal">
            <input
              value={values.mainOffer}
              onChange={(event) => setField('mainOffer', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <Field label="Publico-alvo">
            <input
              value={values.targetAudience}
              onChange={(event) => setField('targetAudience', event.target.value)}
              className={inputClassName}
            />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Descricao da oferta">
              <textarea
                value={values.offerDescription}
                onChange={(event) => setField('offerDescription', event.target.value)}
                className={`${inputClassName} min-h-24 resize-y`}
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Diferenciais">
              <textarea
                value={values.differentiators}
                onChange={(event) => setField('differentiators', event.target.value)}
                className={`${inputClassName} min-h-20 resize-y`}
                placeholder="O que torna esta oferta diferente da concorrencia"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Prova social">
              <textarea
                value={values.socialProof}
                onChange={(event) => setField('socialProof', event.target.value)}
                className={`${inputClassName} min-h-20 resize-y`}
                placeholder="Depoimentos, numeros, cases de sucesso"
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
          <Field label="CTA principal">
            <input
              value={values.mainCta}
              onChange={(event) => setField('mainCta', event.target.value)}
              className={inputClassName}
              placeholder="Ex.: Falar no WhatsApp, Agendar diagnostico"
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
                placeholder="Uma pergunta e resposta por linha"
              />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Observacoes">
              <textarea
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                className={`${inputClassName} min-h-20 resize-y`}
                placeholder="Contexto adicional para quem for montar a LP"
              />
            </Field>
          </div>
        </Section>
      </div>
    </Card>
  );
}

const inputClassName = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-t border-border pt-5 first:border-t-0 first:pt-0">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

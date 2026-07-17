import { Badge, Card } from '../../../components/ui';
import type { LandingPageAiGeneration } from '../landing-page-ai.types';
import type { ClientLandingPage } from '../landing-page.types';
import { StepBadge } from './LandingPageStepBadge';

interface LandingPagePreviewProps {
  page: ClientLandingPage | null;
  generation: LandingPageAiGeneration | null;
}

interface PreviewSection {
  title: string;
  body: string;
}

interface PreviewFaqItem {
  question: string;
  answer: string;
}

const HEX_COLOR_PATTERN = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

function validHexColor(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return HEX_COLOR_PATTERN.test(trimmed) ? trimmed : null;
}

// Cada linha de FAQ do briefing e texto livre (sem separacao estrutural de pergunta/resposta),
// entao no fallback tratamos a linha inteira como "pergunta" e deixamos a resposta vazia.
function briefingFaqToPreview(faq: string[] | null): PreviewFaqItem[] {
  return (faq ?? [])
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({ question: line, answer: '' }));
}

export function LandingPagePreview({ page, generation }: LandingPagePreviewProps) {
  const hasAiContent = generation?.status === 'generated';
  const ai = hasAiContent ? generation.generated_content : null;

  // Fonte de conteudo textual: IA (quando ha uma geracao com status "generated") com fallback
  // para o briefing, campo a campo. Dados de contato e identidade visual sempre vem do briefing,
  // ja que `generated_content` nunca contem esses campos.
  const displayName = page?.display_name?.trim() || 'Sua empresa';
  const headline = ai?.headline?.trim() || page?.headline?.trim() || '';
  const subheadline = ai?.subheadline?.trim() || page?.subheadline?.trim() || '';
  const heroCta = ai?.hero_cta?.trim() || page?.main_cta?.trim() || '';
  const finalCta = ai?.final_cta?.trim() || page?.main_cta?.trim() || heroCta;

  const sections: PreviewSection[] =
    ai?.sections && ai.sections.length > 0
      ? ai.sections
      : page?.offer_description?.trim()
        ? [{ title: 'Sobre a oferta', body: page.offer_description.trim() }]
        : [];

  const benefits: string[] = ai?.benefits && ai.benefits.length > 0 ? ai.benefits : [];

  const faq: PreviewFaqItem[] = ai?.faq && ai.faq.length > 0 ? ai.faq : briefingFaqToPreview(page?.faq ?? null);

  const primaryColor = validHexColor(page?.primary_color);
  const secondaryColor = validHexColor(page?.secondary_color);
  const logoUrl = page?.logo_url?.trim() || null;
  const heroImageUrl = page?.hero_image_url?.trim() || null;
  const whatsapp = page?.whatsapp?.trim() || null;
  const contactEmail = page?.contact_email?.trim() || null;
  const location = [page?.city?.trim(), page?.state?.trim()].filter(Boolean).join(' / ');

  const hasContent = Boolean(headline || subheadline || sections.length > 0 || benefits.length > 0 || faq.length > 0);

  const heroBackground = primaryColor
    ? `radial-gradient(600px circle at 50% -10%, color-mix(in oklch, ${primaryColor} 35%, black) 0%, black 70%)`
    : 'radial-gradient(600px circle at 50% -10%, color-mix(in oklch, var(--color-primary) 30%, black) 0%, black 70%)';
  const accentSolid = primaryColor ?? 'var(--color-primary)';
  const footerBackground = secondaryColor
    ? `color-mix(in oklch, ${secondaryColor} 12%, transparent)`
    : primaryColor
      ? `color-mix(in oklch, ${primaryColor} 10%, transparent)`
      : 'var(--color-surface)';

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StepBadge step={5} />
          <h3 className="text-sm font-semibold text-foreground">Preview da LP</h3>
        </div>
        <Badge tone={hasAiContent ? 'brand' : 'neutral'}>{hasAiContent ? 'Conteudo gerado por IA' : 'Baseado no briefing'}</Badge>
      </div>
      <p className="mt-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-semibold text-warning">
        Preview interno. Esta pagina nao esta publicada.
      </p>

      {!hasContent ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Preencha o briefing (ou gere conteudo com IA) para visualizar um preview aqui.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          {/* Hero */}
          <div className="px-6 py-10 text-center sm:py-14" style={{ background: heroBackground }}>
            {logoUrl && (
              <img
                src={logoUrl}
                alt={displayName}
                loading="lazy"
                referrerPolicy="no-referrer"
                className="mx-auto mb-4 h-12 max-w-[160px] object-contain"
              />
            )}
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accentSolid }}>
              {displayName}
            </p>
            <h2 className="mx-auto mt-2 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
              {headline || 'Headline ainda nao definida'}
            </h2>
            {subheadline && <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">{subheadline}</p>}
            {heroCta && (
              <button
                type="button"
                disabled
                className="mt-6 cursor-default rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
                style={{ background: accentSolid }}
              >
                {heroCta}
              </button>
            )}
            {heroImageUrl && (
              <img
                src={heroImageUrl}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className="mx-auto mt-8 max-h-64 w-full max-w-xl rounded-lg object-cover"
              />
            )}
          </div>

          {/* Beneficios */}
          {benefits.length > 0 && (
            <div className="border-t border-border bg-card px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Beneficios</p>
              <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {benefits.map((benefit, index) => (
                  <li key={`${benefit}-${index}`} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accentSolid }} aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Secoes textuais */}
          {sections.length > 0 && (
            <div className="space-y-4 border-t border-border bg-card-elevated px-6 py-6">
              {sections.map((section, index) => (
                <div key={`${section.title}-${index}`}>
                  <p className="text-sm font-semibold text-foreground">{section.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.body}</p>
                </div>
              ))}
            </div>
          )}

          {/* FAQ */}
          {faq.length > 0 && (
            <div className="border-t border-border bg-card px-6 py-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Perguntas frequentes</p>
              <div className="mt-3 space-y-3">
                {faq.map((item, index) => (
                  <div key={`${item.question}-${index}`}>
                    <p className="text-sm font-semibold text-foreground">{item.question}</p>
                    {item.answer && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.answer}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA final e contato */}
          <div className="border-t border-border px-6 py-8 text-center" style={{ background: footerBackground }}>
            {finalCta && <p className="text-lg font-bold text-foreground">{finalCta}</p>}
            {(whatsapp || contactEmail || location) && (
              <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {whatsapp && <span>WhatsApp: {whatsapp}</span>}
                {contactEmail && <span>{contactEmail}</span>}
                {location && <span>{location}</span>}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

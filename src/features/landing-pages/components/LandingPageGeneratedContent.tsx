import { Badge, Card } from '../../../components/ui';
import type { LandingPageAiGeneration } from '../landing-page-ai.types';

interface LandingPageGeneratedContentProps {
  generation: LandingPageAiGeneration;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function LandingPageGeneratedContent({ generation }: LandingPageGeneratedContentProps) {
  const content = generation.generated_content;
  const isFailed = generation.status === 'failed';

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Ultimo conteudo gerado por IA</h3>
        <div className="flex items-center gap-2">
          <Badge tone={isFailed ? 'destructive' : 'success'}>{isFailed ? 'Falhou' : 'Gerado'}</Badge>
          <span className="text-xs text-muted-foreground">{formatDateTime(generation.created_at)}</span>
        </div>
      </div>

      {isFailed ? (
        <p className="mt-3 text-sm text-destructive">{generation.error_message || 'A geracao falhou.'}</p>
      ) : (
        <div className="mt-4 space-y-5">
          {content.headline && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Headline</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{content.headline}</p>
            </div>
          )}
          {content.subheadline && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Subheadline</p>
              <p className="mt-1 text-sm text-muted-foreground">{content.subheadline}</p>
            </div>
          )}
          {content.hero_cta && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">CTA principal</p>
              <p className="mt-1 text-sm text-foreground">{content.hero_cta}</p>
            </div>
          )}
          {content.sections && content.sections.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Secoes</p>
              <div className="mt-2 space-y-3">
                {content.sections.map((section, index) => (
                  <div key={`${section.title}-${index}`} className="rounded-lg border border-border bg-muted/40 p-3">
                    <p className="text-sm font-semibold text-foreground">{section.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">{section.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {content.benefits && content.benefits.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Beneficios</p>
              <ul className="mt-2 space-y-1.5">
                {content.benefits.map((benefit, index) => (
                  <li key={`${benefit}-${index}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {content.faq && content.faq.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">FAQ</p>
              <div className="mt-2 space-y-2.5">
                {content.faq.map((item, index) => (
                  <div key={`${item.question}-${index}`}>
                    <p className="text-sm font-semibold text-foreground">{item.question}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
          {content.final_cta && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">CTA final</p>
              <p className="mt-1 text-sm text-foreground">{content.final_cta}</p>
            </div>
          )}
        </div>
      )}

      <p className="mt-5 border-t border-border pt-3 text-xs text-muted-foreground">
        Conteudo gerado por IA, apenas texto. Nao foi aplicado automaticamente ao briefing, nao publicou nenhuma
        pagina e nao criou preview publico.
      </p>
    </Card>
  );
}

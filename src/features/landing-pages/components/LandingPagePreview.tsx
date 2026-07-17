import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../../../components/ui';
import type { LandingPageAiGeneration } from '../landing-page-ai.types';
import { buildLandingPageContent } from '../landing-page-content';
import type { ClientLandingPage } from '../landing-page.types';
import { StepBadge } from './LandingPageStepBadge';
import { PublicLandingCta } from './PublicLandingCta';
import { PublicLandingFaq } from './PublicLandingFaq';
import { PublicLandingHero } from './PublicLandingHero';
import { PublicLandingSection } from './PublicLandingSection';

interface LandingPagePreviewProps {
  page: ClientLandingPage | null;
  generation: LandingPageAiGeneration | null;
}

export function LandingPagePreview({ page, generation }: LandingPagePreviewProps) {
  const hasAiContent = generation?.status === 'generated';
  const content = buildLandingPageContent(page, hasAiContent ? generation.generated_content : null);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StepBadge step={5} />
          <h3 className="text-sm font-semibold text-foreground">Preview da LP</h3>
        </div>
        <Badge tone={hasAiContent ? 'brand' : 'neutral'}>{hasAiContent ? 'Conteudo gerado por IA' : 'Baseado no briefing'}</Badge>
      </div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-xs font-semibold text-warning">
        <span>Preview interno. Os botoes abaixo nao sao clicaveis aqui.</span>
        {page && (
          <Link to={`/lp/${page.id}`} target="_blank" rel="noreferrer" className="shrink-0">
            <Button type="button" variant="secondary" className="!py-1 !text-[11px]">
              Abrir preview publico
            </Button>
          </Link>
        )}
      </div>

      {!content.hasContent ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Preencha o briefing (ou gere conteudo com IA) para visualizar um preview aqui.
        </p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-xl border border-border">
          <PublicLandingHero content={content} interactive={false} />
          <PublicLandingSection content={content} />
          <PublicLandingFaq content={content} />
          <PublicLandingCta content={content} interactive={false} />
        </div>
      )}
    </Card>
  );
}

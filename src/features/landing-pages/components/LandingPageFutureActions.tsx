import { Button, Card } from '../../../components/ui';
import { getLandingPageAiErrorMessage } from '../landing-page-ai.errors';
import { StepBadge } from './LandingPageStepBadge';

interface LandingPageFutureActionsProps {
  canGenerate: boolean;
  generating: boolean;
  generateDisabledReason?: string;
  generateError?: string | null;
  onGenerate: () => void;
}

export function LandingPageFutureActions({
  canGenerate,
  generating,
  generateDisabledReason,
  generateError,
  onGenerate,
}: LandingPageFutureActionsProps) {
  const generateDisabled = !canGenerate || generating || Boolean(generateDisabledReason);
  const friendlyGenerateError = generateError ? getLandingPageAiErrorMessage(generateError) : null;

  return (
    <Card>
      <div className="flex items-center gap-2">
        <StepBadge step={4} />
        <h3 className="text-sm font-semibold text-foreground">Gerar conteudo com IA</h3>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Com o briefing salvo (e, se quiser, ja complementado pela analise de IA), gere um rascunho de copy - headline,
        secoes, beneficios, FAQ e CTAs - pronto para revisar no preview logo abaixo.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="primary"
          disabled={generateDisabled}
          title={!canGenerate ? 'Apenas admin/gestor podem gerar conteudo com IA' : generateDisabledReason}
          onClick={onGenerate}
        >
          {generating ? 'Gerando...' : 'Gerar com IA'}
        </Button>
      </div>
      {friendlyGenerateError && <p className="mt-3 text-xs text-destructive">{friendlyGenerateError}</p>}

      <div className="mt-4 border-t border-border pt-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Em breve</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" variant="secondary" disabled title="Criacao da LP sera implementada futuramente">
            Criar LP
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled
            title="Publicacao oficial (com controle de status e dominio proprio) sera implementada futuramente. Ja existe um link de preview publico temporario no card de Preview, logo abaixo."
          >
            Publicar
          </Button>
        </div>
      </div>
    </Card>
  );
}

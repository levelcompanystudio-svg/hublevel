import { Button, Card } from '../../../components/ui';

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

  return (
    <Card className="border-dashed">
      <h3 className="text-sm font-semibold text-foreground">Proximos passos</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        "Gerar com IA" cria um rascunho textual a partir do briefing salvo. "Criar LP" e "Publicar" continuam
        desabilitados de proposito: nenhum dos dois cria pagina real nem publica nada hoje.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          disabled={generateDisabled}
          title={!canGenerate ? 'Apenas admin/gestor podem gerar conteudo com IA' : generateDisabledReason}
          onClick={onGenerate}
        >
          {generating ? 'Gerando...' : 'Gerar com IA'}
        </Button>
        <Button type="button" variant="secondary" disabled title="Criacao da LP sera implementada futuramente">
          Criar LP
        </Button>
        <Button type="button" variant="primary" disabled title="Publicacao sera implementada futuramente">
          Publicar
        </Button>
      </div>
      {generateError && <p className="mt-3 text-xs text-destructive">{generateError}</p>}
    </Card>
  );
}

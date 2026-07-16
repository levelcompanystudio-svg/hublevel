import { Button, Card } from '../../../components/ui';

export function LandingPageFutureActions() {
  return (
    <Card className="border-dashed">
      <h3 className="text-sm font-semibold text-foreground">Proximos passos (ainda nao disponiveis)</h3>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Estes botoes representam o fluxo futuro da landing page e estao desabilitados de proposito: nenhum deles
        chama IA, publica nada ou cria qualquer recurso real hoje.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" variant="secondary" disabled title="Geracao por IA sera implementada futuramente">
          Gerar com IA
        </Button>
        <Button type="button" variant="secondary" disabled title="Criacao da LP sera implementada futuramente">
          Criar LP
        </Button>
        <Button type="button" variant="primary" disabled title="Publicacao sera implementada futuramente">
          Publicar
        </Button>
      </div>
    </Card>
  );
}

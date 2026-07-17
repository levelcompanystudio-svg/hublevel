import { Badge, Card } from '../../../components/ui';

const steps = [
  'A landing page e publicada com um formulario ou botao de WhatsApp conectado ao CTA principal.',
  'Cada envio do formulario (ou clique no WhatsApp) vira um lead vinculado a este cliente.',
  'Os leads aparecem numa lista propria, com origem, data e status de contato.',
  'Eventualmente, leads qualificados podem virar tarefas ou atualizacoes automaticamente.',
];

export function LandingPageLeadsInfo() {
  return (
    <Card className="border-dashed">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Como os leads vao funcionar</h3>
        <Badge tone="neutral">Etapa futura</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Nenhum lead e capturado hoje. Esta secao descreve o fluxo planejado para quando a landing page for publicada
        de verdade - nao faz parte do fluxo operacional atual, e so uma referencia do que vem depois.
      </p>
      <ol className="mt-4 space-y-2.5">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-[11px] font-bold text-muted-foreground">
              {index + 1}
            </span>
            {step}
          </li>
        ))}
      </ol>
    </Card>
  );
}

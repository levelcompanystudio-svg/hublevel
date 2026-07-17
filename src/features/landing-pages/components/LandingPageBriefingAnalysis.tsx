import { Badge, Button, Card } from '../../../components/ui';
import type { Document } from '../../documents/documents.types';

interface LandingPageBriefingAnalysisProps {
  selectedDocument: Document | null;
}

// Campos que a analise por IA (etapa futura) vai preencher a partir do briefing de referencia
// selecionado. Mostrados aqui apenas como preview do que esta por vir - nenhum deles e calculado
// ou salvo nesta etapa.
const PENDING_ANALYSIS_FIELDS = [
  'Empresa',
  'Segmento',
  'Publico-alvo',
  'Oferta',
  'Servicos',
  'Diferenciais',
  'Dores do cliente',
  'Objecoes',
  'FAQ',
  'Tom de voz',
  'CTA sugerido',
  'Secoes da landing page',
];

export function LandingPageBriefingAnalysis({ selectedDocument }: LandingPageBriefingAnalysisProps) {
  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Analise do briefing</h3>
        <Badge tone={selectedDocument ? 'warning' : 'neutral'}>
          {selectedDocument ? 'Aguardando analise' : 'Nenhum briefing selecionado'}
        </Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Escolha um briefing anexado acima como referencia. A analise automatica por IA (leitura do arquivo e
        preenchimento sugerido dos campos abaixo) sera implementada em uma etapa futura - nada e lido, chamado ou
        salvo ainda.
      </p>

      {!selectedDocument ? (
        <p className="mt-4 rounded-lg border border-dashed border-border bg-surface/40 px-3 py-4 text-center text-xs text-muted-foreground">
          Nenhum briefing de referencia selecionado. Use o botao "Usar como referencia" em um dos briefings anexados
          acima.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-border bg-surface/40 px-3 py-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Briefing de referencia</p>
            <p className="mt-1 truncate text-sm font-semibold text-foreground">{selectedDocument.title}</p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Resumo estruturado (preview)
            </p>
            <dl className="mt-2 grid gap-x-4 gap-y-1.5 sm:grid-cols-2">
              {PENDING_ANALYSIS_FIELDS.map((field) => (
                <div key={field} className="flex items-center justify-between gap-2 border-b border-border/60 py-1.5 text-xs">
                  <dt className="text-muted-foreground">{field}</dt>
                  <dd className="font-medium text-muted-foreground">Aguardando analise</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex justify-end border-t border-border pt-3">
            <Button type="button" variant="primary" disabled title="Analise por IA sera implementada em etapa futura">
              Analisar briefing (em breve)
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

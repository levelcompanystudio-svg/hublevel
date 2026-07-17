import { Badge, Button, Card } from '../../../components/ui';
import type { Document } from '../../documents/documents.types';
import type { LandingPageBriefingAnalysisResult, LandingPageBriefingAnalysisStatus } from '../landing-page.types';
import { StepBadge } from './LandingPageStepBadge';

interface LandingPageBriefingAnalysisProps {
  selectedDocument: Document | null;
  status: LandingPageBriefingAnalysisStatus;
  analysis: LandingPageBriefingAnalysisResult | null;
  error: string | null;
  onAnalyze: () => void;
  onApply: () => void;
}

const STATUS_BADGE: Record<LandingPageBriefingAnalysisStatus, { label: string; tone: 'neutral' | 'brand' | 'success' | 'warning' | 'destructive' }> = {
  idle: { label: 'Nenhum briefing selecionado', tone: 'neutral' },
  ready: { label: 'Aguardando analise', tone: 'warning' },
  analyzing: { label: 'Analisando...', tone: 'warning' },
  analyzed: { label: 'Analise concluida', tone: 'success' },
  applied: { label: 'Aplicado ao formulario', tone: 'success' },
  error: { label: 'Erro na analise', tone: 'destructive' },
};

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</p>
      <ul className="mt-1.5 space-y-1">
        {items.map((item, index) => (
          <li key={`${item}-${index}`} className="flex items-start gap-2 text-xs text-foreground">
            <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden="true" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function LandingPageBriefingAnalysis({
  selectedDocument,
  status,
  analysis,
  error,
  onAnalyze,
  onApply,
}: LandingPageBriefingAnalysisProps) {
  const badge = STATUS_BADGE[status];
  const canAnalyze = status === 'ready' || status === 'error';
  const isAnalyzing = status === 'analyzing';

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <StepBadge step={3} />
          <h3 className="text-sm font-semibold text-foreground">Analise do briefing</h3>
        </div>
        <Badge tone={badge.tone}>{badge.label}</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Escolha um briefing anexado acima como referencia e clique em "Analisar briefing" para a IA sugerir um
        resumo estruturado. Nada e salvo automaticamente - revise o resultado e, se fizer sentido, use "Aplicar ao
        briefing manual" para preencher o formulario do passo 1 (voce ainda precisa clicar em "Salvar briefing" la
        para confirmar).
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

          {error && (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}

          {analysis && (status === 'analyzed' || status === 'applied') && (
            <div className="space-y-4">
              <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                <Field label="Empresa" value={analysis.companyName} />
                <Field label="Segmento" value={analysis.segment} />
                <Field label="Publico-alvo" value={analysis.audience} />
                <Field label="Oferta" value={analysis.offer} />
                <Field label="Tom de voz" value={analysis.toneOfVoice} />
                <Field label="CTA sugerido" value={analysis.suggestedCta} />
              </div>

              <ListBlock title="Servicos" items={analysis.services} />
              <ListBlock title="Diferenciais" items={analysis.differentiators} />
              <ListBlock title="Dores do cliente" items={analysis.painPoints} />
              <ListBlock title="Objecoes" items={analysis.objections} />

              {analysis.faq.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">FAQ sugerida</p>
                  <div className="mt-1.5 space-y-2">
                    {analysis.faq.map((item, index) => (
                      <div key={`${item.question}-${index}`}>
                        <p className="text-xs font-semibold text-foreground">{item.question}</p>
                        {item.answer && <p className="mt-0.5 text-xs text-muted-foreground">{item.answer}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {analysis.landingPageSections.length > 0 && (
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Secoes sugeridas para a LP</p>
                  <div className="mt-1.5 space-y-2">
                    {analysis.landingPageSections.map((section, index) => (
                      <div key={`${section.title}-${index}`} className="rounded-lg border border-border bg-muted/40 p-2.5">
                        <p className="text-xs font-semibold text-foreground">{section.title}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{section.body}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-3">
            <Button type="button" variant="secondary" disabled={!canAnalyze} onClick={onAnalyze}>
              {isAnalyzing ? 'Analisando...' : status === 'error' ? 'Tentar analisar novamente' : 'Analisar briefing'}
            </Button>
            {analysis && (
              <Button type="button" variant="primary" disabled={status === 'applied'} onClick={onApply}>
                {status === 'applied' ? 'Aplicado ao briefing manual' : 'Aplicar ao briefing manual'}
              </Button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-xs text-foreground">{value}</p>
    </div>
  );
}

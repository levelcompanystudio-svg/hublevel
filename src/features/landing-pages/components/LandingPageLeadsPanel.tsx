import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge, Card } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { listLandingPageLeads, updateLandingPageLeadStatus } from '../landing-page-leads.api';
import { hasUtmData } from '../landing-page-leads.types';
import type { LandingPageLead, LandingPageLeadStatus } from '../landing-page-leads.types';
import { LandingPageLeadStatusBadge } from './LandingPageLeadStatusBadge';
import { LandingPageLeadStatusSelect } from './LandingPageLeadStatusSelect';

interface LandingPageLeadsPanelProps {
  clientId: string;
  hasPublishedLink: boolean;
}

function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function utmSummary(lead: LandingPageLead): string {
  return [
    lead.utm_source ? `origem: ${lead.utm_source}` : null,
    lead.utm_medium ? `midia: ${lead.utm_medium}` : null,
    lead.utm_campaign ? `campanha: ${lead.utm_campaign}` : null,
    lead.utm_content ? `conteudo: ${lead.utm_content}` : null,
    lead.utm_term ? `termo: ${lead.utm_term}` : null,
  ]
    .filter(Boolean)
    .join(' - ');
}

export function LandingPageLeadsPanel({ clientId, hasPublishedLink }: LandingPageLeadsPanelProps) {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<LandingPageLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const result = await listLandingPageLeads(clientId);
        if (active) setLeads(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar leads.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [clientId]);

  async function handleStatusChange(leadId: string, status: LandingPageLeadStatus) {
    if (!profile) return;
    try {
      setUpdatingId(leadId);
      const updated = await updateLandingPageLeadStatus(leadId, status, profile.id);
      setLeads((current) => current.map((lead) => (lead.id === leadId ? updated : lead)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status do lead.');
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Leads recebidos</h3>
        <Badge tone="brand">{leads.length}</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Contatos enviados pelo formulario da landing page pública deste cliente. Nenhuma automação move esses leads
        para tarefas/atualizações ainda — o status é só um marcador manual por enquanto.
      </p>

      {loading && <LoadingState title="Carregando leads" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        <div className="mt-4 space-y-2">
          {leads.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface/40 px-3 py-4 text-center text-xs text-muted-foreground">
              {hasPublishedLink
                ? 'Nenhum lead recebido ainda.'
                : 'Nenhum lead recebido ainda. Salve o briefing para ativar o link publico da landing page.'}
            </p>
          ) : (
            leads.map((lead) => (
              <div key={lead.id} className="rounded-lg border border-border bg-surface/40 px-3 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{lead.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {[lead.email, lead.phone].filter(Boolean).join(' - ') || 'Sem contato informado'}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <LandingPageLeadStatusBadge status={lead.status} />
                    <LandingPageLeadStatusSelect
                      value={lead.status}
                      disabled={updatingId === lead.id}
                      onChange={(status) => void handleStatusChange(lead.id, status)}
                    />
                  </div>
                </div>
                {lead.message && <p className="mt-2 text-xs leading-5 text-muted-foreground">{lead.message}</p>}
                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
                  <span>{hasUtmData(lead) ? utmSummary(lead) : 'Sem dados de UTM'}</span>
                  <span>{formatDateTime(lead.created_at)}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </Card>
  );
}

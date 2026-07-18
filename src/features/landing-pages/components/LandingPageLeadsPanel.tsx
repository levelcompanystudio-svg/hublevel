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

const statusLabels: Record<LandingPageLeadStatus, string> = {
  novo: 'Novos',
  contatado: 'Contatados',
  qualificado: 'Qualificados',
  descartado: 'Descartados',
};

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

function filteredLeads(leads: LandingPageLead[], status: LandingPageLeadStatus | 'todos'): LandingPageLead[] {
  return status === 'todos' ? leads : leads.filter((lead) => lead.status === status);
}

export function LandingPageLeadsPanel({ clientId, hasPublishedLink }: LandingPageLeadsPanelProps) {
  const { profile } = useAuth();
  const [leads, setLeads] = useState<LandingPageLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<LandingPageLeadStatus | 'todos'>('todos');

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

  const visibleLeads = filteredLeads(leads, statusFilter);

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">Leads recebidos</h3>
        <Badge tone="brand">{leads.length}</Badge>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted-foreground">
        Contatos enviados pelo formulario da landing page publica deste cliente. Use o status para organizar o
        atendimento manual.
      </p>

      {loading && <LoadingState title="Carregando leads" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        <div className="mt-4 space-y-3">
          <LeadSummary leads={leads} />

          <div className="flex flex-wrap gap-2">
            {(['todos', 'novo', 'contatado', 'qualificado', 'descartado'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setStatusFilter(status)}
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  statusFilter === status
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-surface/60 text-muted-foreground hover:text-foreground'
                }`}
              >
                {status === 'todos' ? 'Todos' : statusLabels[status]}
              </button>
            ))}
          </div>

          {visibleLeads.length === 0 ? (
            <p className="rounded-lg border border-dashed border-border bg-surface/40 px-3 py-4 text-center text-xs text-muted-foreground">
              {leads.length === 0 && hasPublishedLink
                ? 'Nenhum lead recebido ainda.'
                : leads.length === 0
                  ? 'Nenhum lead recebido ainda. Publique a landing page para ativar o formulario publico.'
                  : 'Nenhum lead encontrado neste filtro.'}
            </p>
          ) : (
            visibleLeads.map((lead) => (
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

function LeadSummary({ leads }: { leads: LandingPageLead[] }) {
  const counts = {
    novo: leads.filter((lead) => lead.status === 'novo').length,
    contatado: leads.filter((lead) => lead.status === 'contatado').length,
    qualificado: leads.filter((lead) => lead.status === 'qualificado').length,
    descartado: leads.filter((lead) => lead.status === 'descartado').length,
  };

  return (
    <div className="grid gap-2 sm:grid-cols-4">
      <SummaryItem label="Novos" value={counts.novo} />
      <SummaryItem label="Contatados" value={counts.contatado} />
      <SummaryItem label="Qualificados" value={counts.qualificado} />
      <SummaryItem label="Descartados" value={counts.descartado} />
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
      <p className="text-[11px] font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">{value}</p>
    </div>
  );
}

import { useCallback, useEffect, useState } from 'react';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { SectionHeader } from '../../components/ui';
import { ClientHealthBadge } from '../clients/components/ClientHealthBadge';
import { ClientStatusBadge } from '../clients/components/ClientStatusBadge';
import { CrmContactsSummary } from '../crm/components/CrmContactsSummary';
import { CrmPipelineOverview } from '../crm/components/CrmPipelineOverview';
import { listCrmContactsByClient, listCrmOpportunitiesByClient, listCrmPipelineStages, listCrmPipelinesByClient } from '../crm/crm.api';
import type { CrmContact, CrmOpportunity, CrmPipeline, CrmPipelineStage } from '../crm/crm.types';
import type { ExternalClientSummary } from './external.api';

interface ExternalClientCrmViewProps {
  client: ExternalClientSummary;
}

const NOOP = () => {};

// Visao somente leitura do CRM para profile_type='external'. Reaproveita os mesmos componentes
// da aba CRM interna (CrmPipelineOverview/CrmContactsSummary) com canManage=false - os proprios
// componentes ja escondem todo botao de criar/editar/mover/trocar status quando canManage e
// false, entao nenhuma logica de escrita fica acessivel aqui, sem duplicar nenhuma regra de
// permissao no frontend. As queries de CRM (crm.api.ts) sao identicas as usadas pelo lado
// interno; a RLS (user_can_access_crm_client, migration 031) ja cobre acesso externo com
// membership ativa. O nome/segmento/status do cliente vem de external.api.ts, que le
// public.clients sob a RLS "external user can read own linked clients" (migration 033). Nenhum
// financeiro, contrato, tarefa, reuniao, documento, integracao ou performance e exibido aqui -
// so o que foi pedido: identificacao basica do cliente, pipeline, etapas, oportunidades e
// contatos.
export function ExternalClientCrmView({ client }: ExternalClientCrmViewProps) {
  const [pipelines, setPipelines] = useState<CrmPipeline[]>([]);
  const [stages, setStages] = useState<CrmPipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [pipelinesResult, contactsResult] = await Promise.all([
        listCrmPipelinesByClient(client.id),
        listCrmContactsByClient(client.id),
      ]);
      setPipelines(pipelinesResult);
      setContacts(contactsResult);

      const defaultPipeline = pipelinesResult.find((pipeline) => pipeline.is_default) ?? pipelinesResult[0] ?? null;

      if (defaultPipeline) {
        const [stagesResult, opportunitiesResult] = await Promise.all([
          listCrmPipelineStages(defaultPipeline.id),
          listCrmOpportunitiesByClient(client.id),
        ]);
        setStages(stagesResult);
        setOpportunities(opportunitiesResult.filter((opportunity) => opportunity.pipeline_id === defaultPipeline.id));
      } else {
        setStages([]);
        setOpportunities([]);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar os dados deste cliente.');
    } finally {
      setLoading(false);
    }
  }, [client.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const defaultPipeline = pipelines.find((pipeline) => pipeline.is_default) ?? pipelines[0] ?? null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4">
        <div className="min-w-0">
          <h1 className="truncate text-h1 text-foreground">{client.trade_name || client.company_name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{client.segment ?? 'Sem segmento'}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <ClientStatusBadge status={client.status} />
          <ClientHealthBadge status={client.health_status} />
        </div>
      </div>

      {loading ? (
        <LoadingState title="Carregando dados do cliente" />
      ) : error ? (
        <ErrorState description={error} />
      ) : (
        <>
          {!defaultPipeline ? (
            <EmptyState
              title="Nenhum pipeline configurado"
              description="Ainda nao ha um pipeline de oportunidades configurado para este cliente."
            />
          ) : (
            <>
              <SectionHeader
                title={defaultPipeline.name}
                caption={`${opportunities.length} ${opportunities.length === 1 ? 'oportunidade' : 'oportunidades'} neste pipeline`}
              />
              <CrmPipelineOverview
                stages={stages}
                opportunities={opportunities}
                canManage={false}
                onEditOpportunity={NOOP}
                onStatusChange={NOOP}
                onMoveStage={NOOP}
              />
            </>
          )}

          <CrmContactsSummary contacts={contacts} canManage={false} onCreateContact={NOOP} onEditContact={NOOP} />
        </>
      )}
    </div>
  );
}

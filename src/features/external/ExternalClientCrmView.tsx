import { useCallback, useEffect, useState } from 'react';
import { EmptyState } from '../../components/feedback/EmptyState';
import { ErrorState } from '../../components/feedback/ErrorState';
import { LoadingState } from '../../components/feedback/LoadingState';
import { SectionHeader } from '../../components/ui';
import { CrmContactsSummary } from '../crm/components/CrmContactsSummary';
import { CrmPipelineOverview } from '../crm/components/CrmPipelineOverview';
import { listCrmContactsByClient, listCrmOpportunitiesByClient, listCrmPipelineStages, listCrmPipelinesByClient } from '../crm/crm.api';
import type { CrmContact, CrmOpportunity, CrmPipeline, CrmPipelineStage } from '../crm/crm.types';

interface ExternalClientCrmViewProps {
  clientId: string;
}

const NOOP = () => {};

// Visao somente leitura do CRM para profile_type='external'. Reaproveita os mesmos componentes
// da aba CRM interna (CrmPipelineOverview/CrmContactsSummary) com canManage=false - os proprios
// componentes ja escondem todo botao de criar/editar/mover/trocar status quando canManage e
// false, entao nenhuma logica de escrita fica acessivel aqui, sem duplicar nenhuma regra de
// permissao no frontend. As queries (crm.api.ts) sao identicas as usadas pelo lado interno; a
// RLS (user_can_access_crm_client, migration 031) ja cobre acesso externo com membership ativa -
// nenhuma policy nova foi necessaria para isto funcionar.
export function ExternalClientCrmView({ clientId }: ExternalClientCrmViewProps) {
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
        listCrmPipelinesByClient(clientId),
        listCrmContactsByClient(clientId),
      ]);
      setPipelines(pipelinesResult);
      setContacts(contactsResult);

      const defaultPipeline = pipelinesResult.find((pipeline) => pipeline.is_default) ?? pipelinesResult[0] ?? null;

      if (defaultPipeline) {
        const [stagesResult, opportunitiesResult] = await Promise.all([
          listCrmPipelineStages(defaultPipeline.id),
          listCrmOpportunitiesByClient(clientId),
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
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) return <LoadingState title="Carregando dados do cliente" />;
  if (error) return <ErrorState description={error} />;

  const defaultPipeline = pipelines.find((pipeline) => pipeline.is_default) ?? pipelines[0] ?? null;

  return (
    <div className="space-y-5">
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
    </div>
  );
}

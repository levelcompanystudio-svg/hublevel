import { useCallback, useEffect, useState } from 'react';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, SectionHeader } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { CrmContactsSummary } from '../../crm/components/CrmContactsSummary';
import { CrmPipelineOverview } from '../../crm/components/CrmPipelineOverview';
import {
  createCrmPipeline,
  createCrmPipelineStage,
  listCrmContactsByClient,
  listCrmOpportunitiesByClient,
  listCrmPipelineStages,
  listCrmPipelinesByClient,
} from '../../crm/crm.api';
import type { CrmContact, CrmOpportunity, CrmPipeline, CrmPipelineStage } from '../../crm/crm.types';

interface ClientCrmTabProps {
  clientId: string;
  canManage: boolean;
}

const DEFAULT_STAGES: Array<{ name: string; position: number; probability: number }> = [
  { name: 'Novo lead', position: 1, probability: 10 },
  { name: 'Em contato', position: 2, probability: 25 },
  { name: 'Proposta', position: 3, probability: 50 },
  { name: 'Negociacao', position: 4, probability: 75 },
  { name: 'Fechado', position: 5, probability: 100 },
];

// Primeira interface visivel do CRM: pipeline padrao do cliente, etapas, oportunidades
// agrupadas por etapa e contatos. Sem Kanban/drag and drop nesta etapa.
export function ClientCrmTab({ clientId, canManage }: ClientCrmTabProps) {
  const { profile } = useAuth();

  const [pipelines, setPipelines] = useState<CrmPipeline[]>([]);
  const [stages, setStages] = useState<CrmPipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingPipeline, setCreatingPipeline] = useState(false);

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
      setError(err instanceof Error ? err.message : 'Erro ao carregar o CRM do cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleCreateInitialPipeline() {
    if (!profile) return;
    setCreatingPipeline(true);
    setError(null);
    try {
      const pipeline = await createCrmPipeline({ client_id: clientId, name: 'Pipeline padrao', is_default: true }, profile.id);
      await Promise.all(
        DEFAULT_STAGES.map((stage) =>
          createCrmPipelineStage(
            { pipeline_id: pipeline.id, name: stage.name, position: stage.position, probability: stage.probability },
            profile.id,
          ),
        ),
      );
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar o pipeline inicial.');
    } finally {
      setCreatingPipeline(false);
    }
  }

  if (loading) return <LoadingState title="Carregando CRM do cliente" />;
  if (error) return <ErrorState description={error} />;

  const defaultPipeline = pipelines.find((pipeline) => pipeline.is_default) ?? pipelines[0] ?? null;

  if (!defaultPipeline) {
    return (
      <div className="space-y-5">
        <EmptyState
          title="CRM ainda nao configurado para este cliente"
          description="Crie o pipeline inicial para comecar a organizar oportunidades e contatos deste cliente."
        />
        {canManage && (
          <div className="flex justify-center">
            <Button type="button" variant="primary" onClick={() => void handleCreateInitialPipeline()} disabled={creatingPipeline}>
              {creatingPipeline ? 'Criando...' : 'Criar pipeline inicial'}
            </Button>
          </div>
        )}
        <CrmContactsSummary contacts={contacts} />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <SectionHeader
        title={defaultPipeline.name}
        caption={`${opportunities.length} ${opportunities.length === 1 ? 'oportunidade' : 'oportunidades'} neste pipeline`}
      />
      <CrmPipelineOverview stages={stages} opportunities={opportunities} />
      <CrmContactsSummary contacts={contacts} />
    </div>
  );
}

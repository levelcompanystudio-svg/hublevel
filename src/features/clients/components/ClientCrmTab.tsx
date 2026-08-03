import { useCallback, useEffect, useState } from 'react';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, SectionHeader } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { CrmContactForm } from '../../crm/components/CrmContactForm';
import { CrmContactsSummary } from '../../crm/components/CrmContactsSummary';
import { CrmOpportunityForm } from '../../crm/components/CrmOpportunityForm';
import { CrmPipelineOverview } from '../../crm/components/CrmPipelineOverview';
import {
  createCrmPipeline,
  createCrmPipelineStage,
  listCrmContactsByClient,
  listCrmOpportunitiesByClient,
  listCrmPipelineStages,
  listCrmPipelinesByClient,
  moveCrmOpportunityStage,
  updateCrmOpportunity,
} from '../../crm/crm.api';
import type { CrmContact, CrmOpportunity, CrmOpportunityStatus, CrmPipeline, CrmPipelineStage } from '../../crm/crm.types';

interface ClientCrmTabProps {
  clientId: string;
  canManage: boolean;
}

// Etapas padrao criadas junto do pipeline inicial (probabilidade so como referencia de estagio,
// nao um calculo de forecast automatico - isso fica para uma etapa futura do CRM).
const DEFAULT_STAGES: Array<{ name: string; position: number; probability: number }> = [
  { name: 'Novo lead', position: 1, probability: 10 },
  { name: 'Em contato', position: 2, probability: 25 },
  { name: 'Proposta', position: 3, probability: 50 },
  { name: 'Negociacao', position: 4, probability: 75 },
  { name: 'Fechado', position: 5, probability: 100 },
];

interface ContactFormState {
  open: boolean;
  contact: CrmContact | null;
}

interface OpportunityFormState {
  open: boolean;
  opportunity: CrmOpportunity | null;
}

const CLOSED_CONTACT_FORM: ContactFormState = { open: false, contact: null };
const CLOSED_OPPORTUNITY_FORM: OpportunityFormState = { open: false, opportunity: null };

// Interface do CRM dentro do detalhe do cliente: pipeline padrao, etapas, oportunidades agrupadas
// por etapa (layout simples, sem Kanban/drag and drop) e contatos, com criacao/edicao basica dos
// dois. So usa src/features/crm/crm.api.ts - nenhuma query fora do CRM, permissao de escrita vem
// da RLS (user_can_manage_crm_client) das migrations 031/032, nada e replicado aqui.
export function ClientCrmTab({ clientId, canManage }: ClientCrmTabProps) {
  const { profile } = useAuth();

  const [pipelines, setPipelines] = useState<CrmPipeline[]>([]);
  const [stages, setStages] = useState<CrmPipelineStage[]>([]);
  const [opportunities, setOpportunities] = useState<CrmOpportunity[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingPipeline, setCreatingPipeline] = useState(false);

  const [contactForm, setContactForm] = useState<ContactFormState>(CLOSED_CONTACT_FORM);
  const [opportunityForm, setOpportunityForm] = useState<OpportunityFormState>(CLOSED_OPPORTUNITY_FORM);

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

  async function handleQuickStatusChange(opportunityId: string, status: CrmOpportunityStatus) {
    if (!profile) return;
    try {
      await updateCrmOpportunity(opportunityId, { status }, profile.id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar o status da oportunidade.');
    }
  }

  async function handleMoveStage(opportunityId: string, stageId: string) {
    if (!profile) return;
    try {
      await moveCrmOpportunityStage(opportunityId, stageId, profile.id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao mover a oportunidade de etapa.');
    }
  }

  function handleContactSaved() {
    setContactForm(CLOSED_CONTACT_FORM);
    void load();
  }

  function handleOpportunitySaved() {
    setOpportunityForm(CLOSED_OPPORTUNITY_FORM);
    void load();
  }

  if (loading) return <LoadingState title="Carregando CRM do cliente" />;
  if (error) return <ErrorState description={error} />;

  const defaultPipeline = pipelines.find((pipeline) => pipeline.is_default) ?? pipelines[0] ?? null;

  return (
    <div className="space-y-5">
      {!defaultPipeline ? (
        <>
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
        </>
      ) : (
        <>
          <SectionHeader
            title={defaultPipeline.name}
            caption={`${opportunities.length} ${opportunities.length === 1 ? 'oportunidade' : 'oportunidades'} neste pipeline`}
            action={
              canManage && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => setOpportunityForm({ open: true, opportunity: null })}
                >
                  Nova oportunidade
                </Button>
              )
            }
          />
          <CrmPipelineOverview
            stages={stages}
            opportunities={opportunities}
            canManage={canManage}
            onEditOpportunity={(opportunity) => setOpportunityForm({ open: true, opportunity })}
            onStatusChange={(opportunityId, status) => void handleQuickStatusChange(opportunityId, status)}
            onMoveStage={(opportunityId, stageId) => void handleMoveStage(opportunityId, stageId)}
          />
        </>
      )}

      <CrmContactsSummary
        contacts={contacts}
        canManage={canManage}
        onCreateContact={() => setContactForm({ open: true, contact: null })}
        onEditContact={(contact) => setContactForm({ open: true, contact })}
      />

      {contactForm.open && profile && (
        <CrmContactForm
          clientId={clientId}
          contact={contactForm.contact}
          userId={profile.id}
          onClose={() => setContactForm(CLOSED_CONTACT_FORM)}
          onSaved={handleContactSaved}
        />
      )}

      {opportunityForm.open && profile && defaultPipeline && (
        <CrmOpportunityForm
          clientId={clientId}
          pipelineId={defaultPipeline.id}
          stages={stages}
          contacts={contacts}
          opportunity={opportunityForm.opportunity}
          userId={profile.id}
          onClose={() => setOpportunityForm(CLOSED_OPPORTUNITY_FORM)}
          onSaved={handleOpportunitySaved}
        />
      )}
    </div>
  );
}

import { supabase } from '../../lib/supabase';
import type {
  CrmContact,
  CrmContactInput,
  CrmContactUpdateInput,
  CrmOpportunity,
  CrmOpportunityContactRef,
  CrmOpportunityInput,
  CrmOpportunityOwnerRef,
  CrmOpportunityStageRef,
  CrmOpportunityUpdateInput,
  CrmPipeline,
  CrmPipelineInput,
  CrmPipelineStage,
  CrmPipelineStageInput,
  CrmPipelineStageUpdateInput,
  CrmPipelineUpdateInput,
} from './crm.types';

// Camada de dados do CRM (migration 032): so leitura/escrita basica das 4 tabelas via RLS
// (user_can_access_crm_client / user_can_manage_crm_client) - nenhum bypass, nenhum uso de
// service role. Sem paginas, rotas ou componentes visuais ainda.

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function throwCrmError(error: { message: string } | null, fallbackMessage: string): never {
  throw new Error(error?.message || fallbackMessage);
}

// --- Pipelines ---------------------------------------------------------------------------------

const pipelineSelect = 'id, client_id, name, status, is_default, created_at, updated_at';

export async function listCrmPipelinesByClient(clientId: string): Promise<CrmPipeline[]> {
  const { data, error } = await supabase
    .from('crm_pipelines')
    .select(pipelineSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throwCrmError(error, 'Erro ao carregar os pipelines do CRM.');
  return (data ?? []) as CrmPipeline[];
}

export async function createCrmPipeline(input: CrmPipelineInput, userId: string): Promise<CrmPipeline> {
  const { data, error } = await supabase
    .from('crm_pipelines')
    .insert({
      client_id: input.client_id,
      name: input.name,
      status: input.status ?? 'active',
      is_default: input.is_default ?? false,
      created_by: userId,
      updated_by: userId,
    })
    .select(pipelineSelect)
    .single();

  if (error) throwCrmError(error, 'Erro ao criar o pipeline do CRM.');
  return data as CrmPipeline;
}

export async function updateCrmPipeline(
  id: string,
  input: CrmPipelineUpdateInput,
  userId: string,
): Promise<CrmPipeline> {
  const { data, error } = await supabase
    .from('crm_pipelines')
    .update({ ...input, updated_by: userId })
    .eq('id', id)
    .is('deleted_at', null)
    .select(pipelineSelect)
    .maybeSingle();

  if (error) throwCrmError(error, 'Erro ao atualizar o pipeline do CRM.');
  if (!data) throw new Error('Pipeline nao encontrado ou sem permissao de acesso.');
  return data as CrmPipeline;
}

// --- Pipeline stages -----------------------------------------------------------------------------

const pipelineStageSelect = 'id, pipeline_id, name, position, probability, status, created_at, updated_at';

export async function listCrmPipelineStages(pipelineId: string): Promise<CrmPipelineStage[]> {
  const { data, error } = await supabase
    .from('crm_pipeline_stages')
    .select(pipelineStageSelect)
    .eq('pipeline_id', pipelineId)
    .is('deleted_at', null)
    .order('position', { ascending: true });

  if (error) throwCrmError(error, 'Erro ao carregar as etapas do pipeline.');
  return (data ?? []) as CrmPipelineStage[];
}

export async function createCrmPipelineStage(
  input: CrmPipelineStageInput,
  userId: string,
): Promise<CrmPipelineStage> {
  const { data, error } = await supabase
    .from('crm_pipeline_stages')
    .insert({
      pipeline_id: input.pipeline_id,
      name: input.name,
      position: input.position,
      probability: input.probability ?? null,
      status: input.status ?? 'active',
      created_by: userId,
      updated_by: userId,
    })
    .select(pipelineStageSelect)
    .single();

  if (error) throwCrmError(error, 'Erro ao criar a etapa do pipeline.');
  return data as CrmPipelineStage;
}

export async function updateCrmPipelineStage(
  id: string,
  input: CrmPipelineStageUpdateInput,
  userId: string,
): Promise<CrmPipelineStage> {
  const { data, error } = await supabase
    .from('crm_pipeline_stages')
    .update({ ...input, updated_by: userId })
    .eq('id', id)
    .is('deleted_at', null)
    .select(pipelineStageSelect)
    .maybeSingle();

  if (error) throwCrmError(error, 'Erro ao atualizar a etapa do pipeline.');
  if (!data) throw new Error('Etapa de pipeline nao encontrada ou sem permissao de acesso.');
  return data as CrmPipelineStage;
}

// --- Contacts ------------------------------------------------------------------------------------

const contactSelect = 'id, client_id, name, email, phone, company_name, position, status, notes, created_at, updated_at';

export async function listCrmContactsByClient(clientId: string): Promise<CrmContact[]> {
  const { data, error } = await supabase
    .from('crm_contacts')
    .select(contactSelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('name', { ascending: true });

  if (error) throwCrmError(error, 'Erro ao carregar os contatos do CRM.');
  return (data ?? []) as CrmContact[];
}

export async function createCrmContact(input: CrmContactInput, userId: string): Promise<CrmContact> {
  const { data, error } = await supabase
    .from('crm_contacts')
    .insert({
      client_id: input.client_id,
      name: input.name,
      email: input.email ?? null,
      phone: input.phone ?? null,
      company_name: input.company_name ?? null,
      position: input.position ?? null,
      status: input.status ?? 'active',
      notes: input.notes ?? null,
      created_by: userId,
      updated_by: userId,
    })
    .select(contactSelect)
    .single();

  if (error) throwCrmError(error, 'Erro ao criar o contato do CRM.');
  return data as CrmContact;
}

export async function updateCrmContact(
  id: string,
  input: CrmContactUpdateInput,
  userId: string,
): Promise<CrmContact> {
  const { data, error } = await supabase
    .from('crm_contacts')
    .update({ ...input, updated_by: userId })
    .eq('id', id)
    .is('deleted_at', null)
    .select(contactSelect)
    .maybeSingle();

  if (error) throwCrmError(error, 'Erro ao atualizar o contato do CRM.');
  if (!data) throw new Error('Contato nao encontrado ou sem permissao de acesso.');
  return data as CrmContact;
}

// --- Opportunities -------------------------------------------------------------------------------

type CrmOpportunityRow = Omit<CrmOpportunity, 'stage' | 'contact' | 'owner'> & {
  stage?: CrmOpportunityStageRef | CrmOpportunityStageRef[] | null;
  contact?: CrmOpportunityContactRef | CrmOpportunityContactRef[] | null;
  owner?: CrmOpportunityOwnerRef | CrmOpportunityOwnerRef[] | null;
};

function mapOpportunity(row: CrmOpportunityRow): CrmOpportunity {
  return {
    ...row,
    stage: firstRelation(row.stage),
    contact: firstRelation(row.contact),
    owner: firstRelation(row.owner),
  };
}

// Joins estritamente necessarios (pedido explicito): stage e contact dentro da opportunity, e o
// profile do owner (so id/name, nada sensivel). crm_opportunities tem 4 FKs para profiles
// (owner_profile_id, created_by, updated_by, deleted_by), entao o hint !constraint precisa ser
// explicito para o PostgREST resolver qual delas usar.
const opportunitySelect = `
  id,
  client_id,
  pipeline_id,
  stage_id,
  contact_id,
  title,
  value,
  status,
  source,
  expected_close_date,
  owner_profile_id,
  notes,
  created_at,
  updated_at,
  stage:crm_pipeline_stages!crm_opportunities_stage_id_fkey(id, name, position),
  contact:crm_contacts!crm_opportunities_contact_id_fkey(id, name, email, phone),
  owner:profiles!crm_opportunities_owner_profile_id_fkey(id, name)
`;

export async function listCrmOpportunitiesByClient(clientId: string): Promise<CrmOpportunity[]> {
  const { data, error } = await supabase
    .from('crm_opportunities')
    .select(opportunitySelect)
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) throwCrmError(error, 'Erro ao carregar as oportunidades do CRM.');
  return ((data ?? []) as CrmOpportunityRow[]).map(mapOpportunity);
}

export async function createCrmOpportunity(
  input: CrmOpportunityInput,
  userId: string,
): Promise<CrmOpportunity> {
  const { data, error } = await supabase
    .from('crm_opportunities')
    .insert({
      client_id: input.client_id,
      pipeline_id: input.pipeline_id,
      stage_id: input.stage_id,
      contact_id: input.contact_id ?? null,
      title: input.title,
      value: input.value ?? null,
      status: input.status ?? 'open',
      source: input.source ?? null,
      expected_close_date: input.expected_close_date ?? null,
      owner_profile_id: input.owner_profile_id ?? null,
      notes: input.notes ?? null,
      created_by: userId,
      updated_by: userId,
    })
    .select(opportunitySelect)
    .single();

  if (error) throwCrmError(error, 'Erro ao criar a oportunidade do CRM.');
  return mapOpportunity(data as CrmOpportunityRow);
}

export async function updateCrmOpportunity(
  id: string,
  input: CrmOpportunityUpdateInput,
  userId: string,
): Promise<CrmOpportunity> {
  const { data, error } = await supabase
    .from('crm_opportunities')
    .update({ ...input, updated_by: userId })
    .eq('id', id)
    .is('deleted_at', null)
    .select(opportunitySelect)
    .maybeSingle();

  if (error) throwCrmError(error, 'Erro ao atualizar a oportunidade do CRM.');
  if (!data) throw new Error('Oportunidade nao encontrada ou sem permissao de acesso.');
  return mapOpportunity(data as CrmOpportunityRow);
}

// Atalho para o caso de uso mais comum de update (mover card de etapa no Kanban futuro) - so
// troca o stage_id, sem precisar montar um CrmOpportunityUpdateInput inteiro no chamador.
export async function moveCrmOpportunityStage(
  opportunityId: string,
  stageId: string,
  userId: string,
): Promise<CrmOpportunity> {
  return updateCrmOpportunity(opportunityId, { stage_id: stageId }, userId);
}

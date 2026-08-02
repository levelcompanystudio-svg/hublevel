/**
 * Types for the HubLevel CRM base schema (migration 032):
 * crm_pipelines, crm_pipeline_stages, crm_contacts, crm_opportunities.
 *
 * Mirrors the DB schema/RLS 1:1 - no UI, no derived/aggregated fields here.
 */

export type CrmStatus = 'active' | 'inactive';
export type CrmOpportunityStatus = 'open' | 'won' | 'lost' | 'archived';

export interface CrmPipeline {
  id: string;
  client_id: string;
  name: string;
  status: CrmStatus;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface CrmPipelineStage {
  id: string;
  pipeline_id: string;
  name: string;
  position: number;
  probability: number | null;
  status: CrmStatus;
  created_at: string;
  updated_at: string;
}

export interface CrmContact {
  id: string;
  client_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company_name: string | null;
  position: string | null;
  status: CrmStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// Joins embutidos em CrmOpportunity - somente os campos realmente usados, nao a linha inteira
// da tabela relacionada (stage/contact/owner sao apenas referencias de contexto).
export interface CrmOpportunityStageRef {
  id: string;
  name: string;
  position: number;
}

export interface CrmOpportunityContactRef {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
}

export interface CrmOpportunityOwnerRef {
  id: string;
  name: string;
}

export interface CrmOpportunity {
  id: string;
  client_id: string;
  pipeline_id: string;
  stage_id: string;
  contact_id: string | null;
  title: string;
  value: number | null;
  status: CrmOpportunityStatus;
  source: string | null;
  expected_close_date: string | null;
  owner_profile_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  stage?: CrmOpportunityStageRef | null;
  contact?: CrmOpportunityContactRef | null;
  owner?: CrmOpportunityOwnerRef | null;
}

// --- Create inputs ---------------------------------------------------------------------------

export interface CrmPipelineInput {
  client_id: string;
  name: string;
  status?: CrmStatus;
  is_default?: boolean;
}

export interface CrmPipelineStageInput {
  pipeline_id: string;
  name: string;
  position: number;
  probability?: number | null;
  status?: CrmStatus;
}

export interface CrmContactInput {
  client_id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  position?: string | null;
  status?: CrmStatus;
  notes?: string | null;
}

export interface CrmOpportunityInput {
  client_id: string;
  pipeline_id: string;
  stage_id: string;
  contact_id?: string | null;
  title: string;
  value?: number | null;
  status?: CrmOpportunityStatus;
  source?: string | null;
  expected_close_date?: string | null;
  owner_profile_id?: string | null;
  notes?: string | null;
}

// --- Update inputs -----------------------------------------------------------------------------
// client_id fica de fora do update: e a ancora de qual cliente o registro pertence. Em
// oportunidades, pipeline_id/stage_id podem mudar para suportar movimentacoes futuras, e o
// trigger validate_crm_opportunity_relationships (migration 032) rejeita qualquer combinacao
// pipeline/stage/contact que nao bata com o client_id.

export type CrmPipelineUpdateInput = Partial<Pick<CrmPipelineInput, 'name' | 'status' | 'is_default'>>;

export type CrmPipelineStageUpdateInput = Partial<
  Pick<CrmPipelineStageInput, 'name' | 'position' | 'probability' | 'status'>
>;

export type CrmContactUpdateInput = Partial<
  Pick<CrmContactInput, 'name' | 'email' | 'phone' | 'company_name' | 'position' | 'status' | 'notes'>
>;

export type CrmOpportunityUpdateInput = Partial<
  Pick<
    CrmOpportunityInput,
    'pipeline_id' | 'stage_id' | 'contact_id' | 'title' | 'value' | 'status' | 'source' | 'expected_close_date' | 'owner_profile_id' | 'notes'
  >
>;

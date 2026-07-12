import type { RoleName } from '../auth/auth.types';

export type ClientStatus = 'onboarding' | 'ativo' | 'pausado' | 'encerrado';
export type ClientHealthStatus = 'saudavel' | 'atencao' | 'critico';

export interface ResponsibleProfile {
  id: string;
  name: string;
  email: string;
  roles?: {
    name: RoleName;
  };
}

export interface Client {
  id: string;
  company_name: string;
  trade_name: string | null;
  document_number: string | null;
  segment: string | null;
  status: ClientStatus;
  responsible_user_id: string;
  health_status: ClientHealthStatus;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  responsible?: ResponsibleProfile | null;
}

export interface ClientFormValues {
  company_name: string;
  trade_name: string;
  document_number: string;
  segment: string;
  status: ClientStatus;
  responsible_user_id: string;
  health_status: ClientHealthStatus;
  start_date: string;
  end_date: string;
  notes: string;
}

export const emptyClientFormValues: ClientFormValues = {
  company_name: '',
  trade_name: '',
  document_number: '',
  segment: '',
  status: 'onboarding',
  responsible_user_id: '',
  health_status: 'saudavel',
  start_date: '',
  end_date: '',
  notes: '',
};

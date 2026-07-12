export type ServiceStatus = 'ativo' | 'inativo';
export type BillingCycle = 'one_time' | 'monthly' | 'quarterly' | 'yearly';

export interface Service {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  default_price: number | null;
  billing_cycle: BillingCycle | null;
  status: ServiceStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface ServiceFormValues {
  name: string;
  description: string;
  category: string;
  default_price: string;
  billing_cycle: BillingCycle | '';
  status: ServiceStatus;
  notes: string;
}

export const emptyServiceFormValues: ServiceFormValues = {
  name: '',
  description: '',
  category: '',
  default_price: '',
  billing_cycle: '',
  status: 'ativo',
  notes: '',
};

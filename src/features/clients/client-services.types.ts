import type { BillingCycle } from '../services/services.types';

export type ClientServiceStatus = 'ativo' | 'pausado' | 'encerrado';

export interface ClientServiceCatalogItem {
  id: string;
  name: string;
  category: string | null;
  default_price: number | null;
  billing_cycle: BillingCycle | null;
  status: string;
}

export interface ClientService {
  id: string;
  client_id: string;
  service_id: string;
  status: ClientServiceStatus;
  monthly_value: number | null;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  service?: ClientServiceCatalogItem | ClientServiceCatalogItem[] | null;
}

export interface ClientServiceFormValues {
  service_id: string;
  status: ClientServiceStatus;
  monthly_value: string;
  start_date: string;
  end_date: string;
  notes: string;
}

export const emptyClientServiceFormValues: ClientServiceFormValues = {
  service_id: '',
  status: 'ativo',
  monthly_value: '',
  start_date: '',
  end_date: '',
  notes: '',
};

export function validateClientServiceForm(
  values: ClientServiceFormValues,
  existing: ClientService[],
  editingId: string | null,
): string | null {
  if (!values.service_id) return 'Selecione um servico do catalogo.';
  if (!values.status) return 'Selecione o status do servico contratado.';

  if (values.monthly_value.trim() !== '') {
    if (Number.isNaN(Number(values.monthly_value)) || Number(values.monthly_value) < 0) {
      return 'O valor mensal deve ser zero ou maior.';
    }
  }

  if (values.start_date && values.end_date && values.end_date < values.start_date) {
    return 'A data de encerramento nao pode ser anterior a data de inicio.';
  }

  if (values.status === 'ativo') {
    const hasDuplicate = existing.some(
      (item) => item.service_id === values.service_id && item.status === 'ativo' && item.id !== editingId,
    );
    if (hasDuplicate) {
      return 'Este cliente ja possui esse servico ativo. Encerre ou pause o vinculo atual antes de criar outro.';
    }
  }

  return null;
}

export type ContractStatus = 'pendente' | 'ativo' | 'vencido' | 'encerrado' | 'cancelado';

export interface ContractClient {
  id: string;
  company_name: string;
  trade_name: string | null;
}

export interface Contract {
  id: string;
  client_id: string;
  document_id: string | null;
  status: ContractStatus;
  start_date: string;
  end_date: string | null;
  monthly_value: number;
  billing_day: number;
  notice_period_days: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: ContractClient | ContractClient[] | null;
}

export interface ContractFormValues {
  client_id: string;
  status: ContractStatus;
  start_date: string;
  end_date: string;
  monthly_value: string;
  billing_day: string;
  notice_period_days: string;
  notes: string;
}

export const emptyContractFormValues: ContractFormValues = {
  client_id: '',
  status: 'pendente',
  start_date: '',
  end_date: '',
  monthly_value: '',
  billing_day: '',
  notice_period_days: '',
  notes: '',
};

export function validateContractForm(values: ContractFormValues): string | null {
  if (!values.client_id) return 'Selecione um cliente.';
  if (!values.status) return 'Selecione o status do contrato.';
  if (!values.start_date) return 'Informe a data de inicio.';

  if (values.monthly_value.trim() === '' || Number.isNaN(Number(values.monthly_value))) {
    return 'Informe um valor mensal valido.';
  }
  if (Number(values.monthly_value) < 0) {
    return 'O valor mensal nao pode ser negativo.';
  }

  if (values.billing_day.trim() === '' || Number.isNaN(Number(values.billing_day))) {
    return 'Informe o dia de cobranca.';
  }
  const billingDay = Number(values.billing_day);
  if (billingDay < 1 || billingDay > 31) {
    return 'O dia de cobranca deve estar entre 1 e 31.';
  }

  if (values.notice_period_days.trim() !== '') {
    if (Number.isNaN(Number(values.notice_period_days)) || Number(values.notice_period_days) < 0) {
      return 'O prazo de aviso previo deve ser zero ou maior.';
    }
  }

  if (values.end_date && values.end_date < values.start_date) {
    return 'A data de encerramento nao pode ser anterior a data de inicio.';
  }

  return null;
}

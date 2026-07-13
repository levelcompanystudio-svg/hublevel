export type FinancialStatus = 'previsto' | 'pago' | 'atrasado' | 'cancelado';
export type PaymentMethod = 'pix' | 'boleto' | 'cartao' | 'transferencia' | 'dinheiro' | 'outro';

export interface FinanceClient {
  id: string;
  company_name: string;
  trade_name: string | null;
}

export interface FinancialRecord {
  id: string;
  client_id: string;
  contract_id: string | null;
  competence_month: string;
  description: string | null;
  amount: number;
  due_date: string;
  payment_date: string | null;
  status: FinancialStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  client?: FinanceClient | FinanceClient[] | null;
}

export interface Payment {
  id: string;
  financial_record_id: string;
  amount: number;
  paid_at: string;
  method: PaymentMethod | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface FinancialRecordFormValues {
  client_id: string;
  competence_month: string;
  description: string;
  amount: string;
  due_date: string;
  status: FinancialStatus;
  notes: string;
}

export interface PaymentFormValues {
  amount: string;
  paid_at: string;
  method: PaymentMethod | '';
  notes: string;
}

export const emptyFinancialRecordFormValues: FinancialRecordFormValues = {
  client_id: '',
  competence_month: '',
  description: '',
  amount: '',
  due_date: '',
  status: 'previsto',
  notes: '',
};

export const emptyPaymentFormValues: PaymentFormValues = {
  amount: '',
  paid_at: '',
  method: '',
  notes: '',
};

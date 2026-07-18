import type { RoleName } from '../auth/auth.types';

export type DeliverableStatus = 'pending' | 'in_progress' | 'delivered' | 'approved' | 'overdue' | 'canceled';
export type DeliverablePriority = 'low' | 'medium' | 'high' | 'urgent';

export interface DeliverableClient {
  id: string;
  company_name: string;
  trade_name: string | null;
  responsible_user_id?: string;
  responsible?: DeliverableProfile | DeliverableProfile[] | null;
}

export interface DeliverableProfile {
  id: string;
  name: string;
  email: string;
  roles?: { name: RoleName } | { name: RoleName }[] | null;
}

export interface Deliverable {
  id: string;
  client_id: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  priority: DeliverablePriority;
  reference_month: string | null;
  due_date: string | null;
  completed_at: string | null;
  assigned_to: string | null;
  document_id: string | null;
  task_id: string | null;
  notes: string | null;
  created_by: string | null;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  client?: DeliverableClient | DeliverableClient[] | null;
  assignee?: DeliverableProfile | DeliverableProfile[] | null;
}

export interface DeliverableFormValues {
  client_id: string;
  title: string;
  description: string;
  status: DeliverableStatus;
  priority: DeliverablePriority;
  reference_month: string;
  due_date: string;
  assigned_to: string;
  notes: string;
}

export const emptyDeliverableFormValues: DeliverableFormValues = {
  client_id: '',
  title: '',
  description: '',
  status: 'pending',
  priority: 'medium',
  reference_month: '',
  due_date: '',
  assigned_to: '',
  notes: '',
};

export const COLABORADOR_ALLOWED_STATUSES: DeliverableStatus[] = ['in_progress', 'delivered'];

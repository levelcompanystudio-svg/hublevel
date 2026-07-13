import type { RoleName } from '../auth/auth.types';

export type TaskStatus = 'a_fazer' | 'em_andamento' | 'aguardando_cliente' | 'em_revisao' | 'concluida' | 'cancelada';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'urgente';

export interface TaskClient {
  id: string;
  company_name: string;
  trade_name: string | null;
}

export interface TaskProfile {
  id: string;
  name: string;
  email: string;
  roles?: { name: RoleName } | { name: RoleName }[] | null;
}

export interface Task {
  id: string;
  client_id: string | null;
  title: string;
  description: string | null;
  assigned_to_user_id: string | null;
  created_by_user_id: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  category: string | null;
  notes: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  client?: TaskClient | TaskClient[] | null;
  assignee?: TaskProfile | TaskProfile[] | null;
  creator?: TaskProfile | TaskProfile[] | null;
}

export interface TaskFormValues {
  client_id: string;
  title: string;
  description: string;
  assigned_to_user_id: string;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  category: string;
  notes: string;
}

export const emptyTaskFormValues: TaskFormValues = {
  client_id: '',
  title: '',
  description: '',
  assigned_to_user_id: '',
  priority: 'media',
  status: 'a_fazer',
  due_date: '',
  category: '',
  notes: '',
};

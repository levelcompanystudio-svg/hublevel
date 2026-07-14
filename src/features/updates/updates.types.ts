export type UpdateStatus = 'rascunho' | 'registrada' | 'enviada';

export interface UpdateClientRef {
  id: string;
  company_name: string;
  trade_name: string | null;
}

export interface UpdateResponsibleRef {
  id: string;
  name: string;
}

export interface Update {
  id: string;
  client_id: string;
  title: string;
  description: string;
  category: string | null;
  responsible_user_id: string;
  status: UpdateStatus;
  update_date: string;
  next_action: string | null;
  sent_to_client: boolean;
  created_at: string;
  updated_at: string;
  client?: UpdateClientRef | UpdateClientRef[] | null;
  responsible?: UpdateResponsibleRef | UpdateResponsibleRef[] | null;
}

export interface UpdateFormValues {
  client_id: string;
  title: string;
  description: string;
  category: string;
  responsible_user_id: string;
  status: UpdateStatus;
  update_date: string;
  next_action: string;
  sent_to_client: boolean;
}

export function createEmptyUpdateFormValues(defaultResponsibleId = ''): UpdateFormValues {
  return {
    client_id: '',
    title: '',
    description: '',
    category: '',
    responsible_user_id: defaultResponsibleId,
    status: 'registrada',
    update_date: new Date().toISOString().slice(0, 10),
    next_action: '',
    sent_to_client: false,
  };
}

export function validateUpdateForm(values: UpdateFormValues): string | null {
  if (!values.client_id) return 'Selecione um cliente.';
  if (!values.title.trim()) return 'Informe um titulo para a atualizacao.';
  if (!values.description.trim()) return 'Descreva a atualizacao.';
  if (!values.responsible_user_id) return 'Selecione um responsavel.';
  if (!values.status) return 'Selecione o status da atualizacao.';
  if (!values.update_date) return 'Informe a data da atualizacao.';
  return null;
}

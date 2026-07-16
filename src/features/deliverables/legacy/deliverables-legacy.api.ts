import { listDocuments } from '../../documents/documents.api';
import type { Document, DocumentType } from '../../documents/documents.types';
import { listTasks } from '../../tasks/tasks.api';
import type { Task } from '../../tasks/tasks.types';
import { listUpdates } from '../../updates/updates.api';
import type { Update } from '../../updates/updates.types';
import type { Deliverable, DeliverableStatus } from './deliverables-legacy.types';

// LEGACY (pre-migration 017): antes de existir a tabela `deliverables`, esta camada derivava
// "entregaveis" de dados ja existentes, reaproveitando listTasks()/listDocuments()/listUpdates() sem criar
// nenhuma query nova:
// - tarefas cuja categoria contem "entreg" (ex.: "Entregavel", "Entrega mensal");
// - documentos dos tipos relatorio/planejamento/comprovante/outro (contrato/proposta/briefing ficam de fora);
// - atualizacoes cuja categoria contem "entreg", como sinal de comunicacao de entrega ao cliente.

const DELIVERABLE_DOCUMENT_TYPES: DocumentType[] = ['relatorio', 'planejamento', 'comprovante', 'outro'];
const NON_OPEN_TASK_STATUSES = ['concluida', 'cancelada'];

function isDeliverableCategory(category: string | null): boolean {
  return category !== null && category.toLowerCase().includes('entreg');
}

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function taskToDeliverable(task: Task): Deliverable {
  const client = firstRelation(task.client);
  const assignee = firstRelation(task.assignee);
  const today = todayDateOnly();

  let status: DeliverableStatus;
  const isOpen = !NON_OPEN_TASK_STATUSES.includes(task.status);
  if (isOpen && task.due_date !== null && task.due_date < today) {
    status = 'vencido';
  } else if (task.status === 'concluida') {
    status = 'concluido';
  } else if (task.status === 'a_fazer') {
    status = 'pendente';
  } else {
    status = 'em_andamento';
  }

  return {
    id: `tarefa-${task.id}`,
    origin: 'tarefa',
    title: task.title,
    clientId: task.client_id,
    clientName: client ? (client.trade_name || client.company_name) : null,
    status,
    referenceDate: task.due_date,
    responsibleName: assignee?.name ?? null,
    linkTo: `/app/tarefas/${task.id}`,
  };
}

function documentToDeliverable(document: Document): Deliverable {
  const client = firstRelation(document.client);

  return {
    id: `documento-${document.id}`,
    origin: 'documento',
    title: document.title,
    clientId: document.client_id,
    clientName: client ? (client.trade_name || client.company_name) : null,
    // Documentos nao tem campo de status no schema: a existencia do documento
    // representa o entregavel ja concluido/entregue.
    status: 'concluido',
    referenceDate: document.created_at,
    responsibleName: null,
    linkTo: `/app/documentos/${document.id}`,
  };
}

function updateToDeliverable(update: Update): Deliverable {
  const client = firstRelation(update.client);
  const responsible = firstRelation(update.responsible);

  return {
    id: `update-${update.id}`,
    origin: 'update',
    title: update.title,
    clientId: update.client_id,
    clientName: client ? (client.trade_name || client.company_name) : null,
    status: update.status === 'enviada' ? 'concluido' : 'pendente',
    referenceDate: update.update_date,
    responsibleName: responsible?.name ?? null,
    linkTo: `/app/acompanhamento/${update.id}`,
  };
}

export async function listDeliverables(): Promise<Deliverable[]> {
  const [tasks, documents, updates] = await Promise.all([
    listTasks(),
    listDocuments(),
    listUpdates(),
  ]);

  const taskDeliverables = tasks
    .filter((task) => isDeliverableCategory(task.category))
    .map(taskToDeliverable);

  const documentDeliverables = documents
    .filter((document) => DELIVERABLE_DOCUMENT_TYPES.includes(document.type))
    .map(documentToDeliverable);

  const updateDeliverables = updates
    .filter((update) => isDeliverableCategory(update.category))
    .map(updateToDeliverable);

  return [...taskDeliverables, ...documentDeliverables, ...updateDeliverables].sort((a, b) => {
    const dateA = a.referenceDate ?? '';
    const dateB = b.referenceDate ?? '';
    return dateB.localeCompare(dateA);
  });
}

export async function listDeliverablesByClient(clientId: string): Promise<Deliverable[]> {
  const items = await listDeliverables();
  return items.filter((item) => item.clientId === clientId);
}

import { listDeliverablesByClient } from '../deliverables/deliverables.api';
import type { Deliverable } from '../deliverables/deliverables.types';
import { listDocumentsByClient } from '../documents/documents.api';
import type { Document } from '../documents/documents.types';
import { getClientLandingPage } from '../landing-pages/landing-page.api';
import type { ClientLandingPage } from '../landing-pages/landing-page.types';
import { listMeetingsByClient } from '../meetings/meetings.api';
import type { Meeting } from '../meetings/meetings.types';
import { listTasks } from '../tasks/tasks.api';
import type { Task } from '../tasks/tasks.types';
import { listUpdatesByClient } from '../updates/updates.api';
import type { Update } from '../updates/updates.types';
import type { ClientHistoryEvent } from './client-history.types';

// Nao existe tabela de historico/auditoria ainda: este modulo apenas normaliza, em memoria,
// eventos ja existentes de outras tabelas (tasks/updates/meetings/documents/deliverables/
// client_landing_pages) reaproveitando as APIs de listagem por cliente ja existentes. A RLS de
// cada tabela de origem continua sendo quem decide o que o usuario atual pode ver; nenhuma
// query nova ou bypass de RLS e feito aqui.

function firstRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function taskToEvent(task: Task): ClientHistoryEvent {
  const assignee = firstRelation(task.assignee);
  const creator = firstRelation(task.creator);
  return {
    id: `task-${task.id}`,
    type: 'task',
    title: task.title,
    description: task.description,
    date: task.completed_at ?? task.due_date ?? task.created_at,
    status: task.status,
    actorName: assignee?.name ?? creator?.name ?? null,
    href: `/app/tarefas/${task.id}`,
  };
}

function updateToEvent(update: Update): ClientHistoryEvent {
  const responsible = firstRelation(update.responsible);
  return {
    id: `update-${update.id}`,
    type: 'update',
    title: update.title,
    description: update.description,
    date: update.update_date ?? update.created_at,
    status: update.status,
    actorName: responsible?.name ?? null,
    href: `/app/acompanhamento/${update.id}`,
  };
}

function meetingToEvent(meeting: Meeting): ClientHistoryEvent {
  const creator = firstRelation(meeting.creator);
  return {
    id: `meeting-${meeting.id}`,
    type: 'meeting',
    title: meeting.title,
    description: meeting.agenda ?? meeting.notes,
    date: meeting.scheduled_at,
    status: meeting.status,
    actorName: creator?.name ?? null,
    href: `/app/reunioes/${meeting.id}`,
  };
}

function documentToEvent(document: Document): ClientHistoryEvent {
  const creator = firstRelation(document.creator);
  return {
    id: `document-${document.id}`,
    type: 'document',
    title: document.title,
    description: document.description,
    date: document.created_at,
    status: null,
    actorName: creator?.name ?? null,
    href: `/app/documentos/${document.id}`,
  };
}

function deliverableToEvent(deliverable: Deliverable): ClientHistoryEvent {
  const assignee = firstRelation(deliverable.assignee);
  return {
    id: `deliverable-${deliverable.id}`,
    type: 'deliverable',
    title: deliverable.title,
    description: deliverable.description,
    date: deliverable.completed_at ?? deliverable.due_date ?? deliverable.updated_at,
    status: deliverable.status,
    actorName: assignee?.name ?? null,
    href: `/app/entregaveis/${deliverable.id}`,
  };
}

function landingPageToEvent(page: ClientLandingPage): ClientHistoryEvent {
  return {
    id: `landing_page-${page.id}`,
    type: 'landing_page',
    title: page.display_name || 'Briefing de landing page',
    description: page.headline,
    date: page.updated_at,
    status: page.status,
    actorName: null,
    href: null,
  };
}

export async function listClientHistory(clientId: string): Promise<ClientHistoryEvent[]> {
  const [tasks, updates, meetings, documents, deliverables, landingPage] = await Promise.all([
    // tasks nao tem um listByClient dedicado; filtramos no cliente aqui, igual ao ClientTasksTab.
    listTasks(),
    listUpdatesByClient(clientId),
    listMeetingsByClient(clientId),
    listDocumentsByClient(clientId),
    listDeliverablesByClient(clientId),
    getClientLandingPage(clientId),
  ]);

  const clientTasks = tasks.filter((task) => task.client_id === clientId);

  const events: ClientHistoryEvent[] = [
    ...clientTasks.map(taskToEvent),
    ...updates.map(updateToEvent),
    ...meetings.map(meetingToEvent),
    ...documents.map(documentToEvent),
    ...deliverables.map(deliverableToEvent),
    ...(landingPage ? [landingPageToEvent(landingPage)] : []),
  ];

  return events.sort((a, b) => toTimestamp(b.date) - toTimestamp(a.date));
}

function toTimestamp(value: string): number {
  const normalized = value.includes('T') ? value : `${value}T00:00:00`;
  const timestamp = Date.parse(normalized);
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

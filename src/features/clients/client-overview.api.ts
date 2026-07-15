import { listClientServices } from './client-services.api';
import { listDocumentsByClient } from '../documents/documents.api';
import { listMeetingsByClient } from '../meetings/meetings.api';
import { listTasks } from '../tasks/tasks.api';
import { listUpdatesByClient } from '../updates/updates.api';
import type { ClientOverviewData, ClientOverviewMetrics } from './client-overview.types';

const NON_OPEN_TASK_STATUSES = ['concluida', 'cancelada'];

// Reaproveita as mesmas queries ja usadas pelas abas do cliente (tasks.api, updates.api,
// meetings.api, client-services.api, documents.api) - nenhuma query nova e criada aqui.
export async function getClientOverview(clientId: string): Promise<ClientOverviewData> {
  const [allTasks, updates, meetings, services, documents] = await Promise.all([
    listTasks(),
    listUpdatesByClient(clientId),
    listMeetingsByClient(clientId),
    listClientServices(clientId),
    listDocumentsByClient(clientId),
  ]);

  return {
    tasks: allTasks.filter((task) => task.client_id === clientId),
    updates,
    meetings,
    services,
    documents,
  };
}

export function computeClientOverviewMetrics(data: ClientOverviewData): ClientOverviewMetrics {
  const today = new Date().toISOString().slice(0, 10);
  const nowIso = new Date().toISOString();

  let openTasks = 0;
  let overdueTasks = 0;
  let checklistTotal = 0;
  let checklistDone = 0;

  for (const task of data.tasks) {
    const isOpen = !NON_OPEN_TASK_STATUSES.includes(task.status);
    if (isOpen) {
      openTasks += 1;
      if (task.due_date !== null && task.due_date < today) overdueTasks += 1;
    }
    if (task.status !== 'cancelada') {
      checklistTotal += 1;
      if (task.status === 'concluida') checklistDone += 1;
    }
  }

  const activeServices = data.services.filter((service) => service.status === 'ativo').length;

  // updates ja vem ordenado por update_date desc (listUpdatesByClient)
  const lastUpdate = data.updates[0] ?? null;

  const nextMeeting = data.meetings
    .filter((meeting) => meeting.status === 'agendada' && meeting.scheduled_at >= nowIso)
    .sort((a, b) => a.scheduled_at.localeCompare(b.scheduled_at))[0] ?? null;

  const recentDocuments = [...data.documents]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5);

  return {
    activeServices,
    openTasks,
    overdueTasks,
    checklistTotal,
    checklistDone,
    lastUpdate,
    nextMeeting,
    recentDocuments,
  };
}

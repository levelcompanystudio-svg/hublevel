import { listTasks } from '../tasks/tasks.api';
import type { ChecklistItem } from './checklist.types';

// Nao ha tabela de checklist no schema atual (verificado em supabase/migrations).
// Reaproveita `tasks` como fonte operacional, sem duplicar a query ou a logica de negocio:
// apenas oculta itens cancelados, que nao fazem sentido como item de checklist ativo.

export async function listChecklistItems(): Promise<ChecklistItem[]> {
  const tasks = await listTasks();
  return tasks.filter((task) => task.status !== 'cancelada');
}

export async function listChecklistItemsByClient(clientId: string): Promise<ChecklistItem[]> {
  const items = await listChecklistItems();
  return items.filter((item) => item.client_id === clientId);
}

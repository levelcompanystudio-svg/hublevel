import type { Task } from '../tasks/tasks.types';

export type ChecklistItem = Task;

export type ChecklistBucket = 'pendente' | 'em_andamento' | 'concluido' | 'vencido';
export type ChecklistFilter = 'todos' | ChecklistBucket;

function todayDateOnly(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getChecklistBucket(item: ChecklistItem): ChecklistBucket {
  const isOverdue = item.status !== 'concluida' && item.due_date !== null && item.due_date < todayDateOnly();
  if (isOverdue) return 'vencido';
  if (item.status === 'concluida') return 'concluido';
  if (item.status === 'a_fazer') return 'pendente';
  // em_andamento, aguardando_cliente, em_revisao
  return 'em_andamento';
}

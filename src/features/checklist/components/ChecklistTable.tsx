import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import { clientName, formatDate, profileName } from '../../tasks/components/TaskTable';
import { TaskPriorityBadge } from '../../tasks/components/TaskPriorityBadge';
import { getChecklistBucket } from '../checklist.types';
import type { ChecklistItem } from '../checklist.types';
import { ChecklistStatusBadge } from './ChecklistStatusBadge';

interface ChecklistTableProps {
  items: ChecklistItem[];
}

export function ChecklistTable({ items }: ChecklistTableProps) {
  if (items.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum item de checklist encontrado"
          description="Ajuste os filtros ou aguarde novas tarefas serem cadastradas para esta carteira."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Item</th>
              <th className="px-5 py-3.5 font-semibold">Cliente</th>
              <th className="px-5 py-3.5 font-semibold">Responsavel</th>
              <th className="px-5 py-3.5 font-semibold">Prioridade</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 font-semibold">Prazo</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((item) => (
              <tr key={item.id} className="bg-card transition-colors hover:bg-card-elevated">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.category || 'Sem categoria'}</p>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{clientName(item)}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{profileName(item.assignee)}</td>
                <td className="px-5 py-4"><TaskPriorityBadge priority={item.priority} /></td>
                <td className="px-5 py-4"><ChecklistStatusBadge bucket={getChecklistBucket(item)} /></td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(item.due_date)}</td>
                <td className="px-5 py-4">
                  <div className="flex justify-end">
                    <Link to={`/app/tarefas/${item.id}`}>
                      <Button type="button" variant="ghost">Ver</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { FinancialRecord } from '../finance.types';
import { FinanceStatusBadge } from './FinanceStatusBadge';

interface FinanceTableProps {
  records: FinancialRecord[];
}

export function FinanceTable({ records }: FinanceTableProps) {
  if (records.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum registro financeiro"
          description="Os lancamentos financeiros cadastrados serao exibidos aqui."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead className="border-b border-border bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-semibold">Cliente</th>
              <th className="px-5 py-3 font-semibold">Descricao</th>
              <th className="px-5 py-3 font-semibold">Competencia</th>
              <th className="px-5 py-3 font-semibold">Valor</th>
              <th className="px-5 py-3 font-semibold">Vencimento</th>
              <th className="px-5 py-3 font-semibold">Status</th>
              <th className="px-5 py-3 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {records.map((record) => (
              <tr key={record.id} className="bg-card">
                <td className="px-5 py-4 text-sm text-foreground">{clientName(record)}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{record.description || '-'}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatMonth(record.competence_month)}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatCurrency(record.amount)}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatDate(record.due_date)}</td>
                <td className="px-5 py-4"><FinanceStatusBadge status={record.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/app/financeiro/${record.id}`}>
                      <Button type="button" variant="ghost">Ver</Button>
                    </Link>
                    <Link to={`/app/financeiro/${record.id}/editar`}>
                      <Button type="button">Editar</Button>
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

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

export function formatDate(value: string | null): string {
  if (!value) return '-';
  return new Intl.DateTimeFormat('pt-BR').format(new Date(`${value}T00:00:00`));
}

export function formatMonth(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { month: '2-digit', year: 'numeric' }).format(new Date(`${value}T00:00:00`));
}

export function clientName(record: FinancialRecord): string {
  const client = Array.isArray(record.client) ? record.client[0] : record.client;
  return client?.trade_name || client?.company_name || 'Cliente';
}

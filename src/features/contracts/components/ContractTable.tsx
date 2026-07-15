import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Contract } from '../contracts.types';
import { ContractStatusBadge } from './ContractStatusBadge';

interface ContractTableProps {
  contracts: Contract[];
}

export function ContractTable({ contracts }: ContractTableProps) {
  if (contracts.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhum contrato cadastrado"
          description="Os contratos administrativos cadastrados serao exibidos aqui."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Contrato</th>
              <th className="px-5 py-3.5 font-semibold">Vigencia</th>
              <th className="px-5 py-3.5 font-semibold">Valor mensal</th>
              <th className="px-5 py-3.5 font-semibold">Dia de cobranca</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contracts.map((contract) => (
              <tr key={contract.id} className="bg-card transition-colors hover:bg-card-elevated">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{contractLabel(contract)}</p>
                  <Link
                    to={`/app/clientes/${contract.client_id}`}
                    className="mt-1 block text-xs text-primary hover:underline"
                  >
                    {clientName(contract)}
                  </Link>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">
                  {formatDate(contract.start_date)} - {contract.end_date ? formatDate(contract.end_date) : 'Sem termino'}
                </td>
                <td className="px-5 py-4 text-sm font-semibold tabular-nums text-foreground">{formatCurrency(contract.monthly_value)}</td>
                <td className="px-5 py-4 text-sm text-muted-foreground">Dia {contract.billing_day}</td>
                <td className="px-5 py-4"><ContractStatusBadge status={contract.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/app/contratos/${contract.id}`}>
                      <Button type="button" variant="ghost">Ver</Button>
                    </Link>
                    <Link to={`/app/contratos/${contract.id}/editar`}>
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

export function clientName(contract: Contract): string {
  const client = Array.isArray(contract.client) ? contract.client[0] : contract.client;
  return client?.trade_name || client?.company_name || 'Cliente';
}

export function contractLabel(contract: Contract): string {
  return `Contrato - ${clientName(contract)}`;
}

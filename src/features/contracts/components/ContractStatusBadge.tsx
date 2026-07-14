import { Badge } from '../../../components/ui';
import type { ContractStatus } from '../contracts.types';

const labels: Record<ContractStatus, string> = {
  pendente: 'Pendente',
  ativo: 'Ativo',
  vencido: 'Vencido',
  encerrado: 'Encerrado',
  cancelado: 'Cancelado',
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  const tone =
    status === 'ativo' ? 'success' : status === 'pendente' ? 'warning' : status === 'vencido' ? 'destructive' : 'neutral';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

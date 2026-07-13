import { Badge } from '../../../components/ui';
import type { PaymentMethod } from '../finance.types';

const labels: Record<PaymentMethod, string> = {
  pix: 'Pix',
  boleto: 'Boleto',
  cartao: 'Cartao',
  transferencia: 'Transferencia',
  dinheiro: 'Dinheiro',
  outro: 'Outro',
};

export function PaymentMethodBadge({ method }: { method: PaymentMethod | null }) {
  if (!method) return <Badge>Sem metodo</Badge>;
  return <Badge tone="brand">{labels[method]}</Badge>;
}

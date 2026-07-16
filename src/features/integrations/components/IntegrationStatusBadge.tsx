import { Badge } from '../../../components/ui';
import type { IntegrationStatus } from '../integrations.types';

const labels: Record<IntegrationStatus, string> = {
  nao_conectado: 'Nao conectado',
  conectado: 'Conectado',
  erro: 'Erro de conexao',
};

export function IntegrationStatusBadge({ status }: { status: IntegrationStatus }) {
  const tone = status === 'conectado' ? 'success' : status === 'erro' ? 'destructive' : 'neutral';
  return <Badge tone={tone}>{labels[status]}</Badge>;
}

import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card } from '../../../components/ui';

interface PerformanceEmptyStateProps {
  title?: string;
  description?: string;
}

export function PerformanceEmptyState({
  title = 'Nenhuma metrica sincronizada ainda',
  description = 'Conecte uma conta Meta Ads na aba Integracoes de um cliente e sincronize manualmente para ver os dados aqui.',
}: PerformanceEmptyStateProps) {
  return (
    <Card>
      <EmptyState title={title} description={description} />
    </Card>
  );
}

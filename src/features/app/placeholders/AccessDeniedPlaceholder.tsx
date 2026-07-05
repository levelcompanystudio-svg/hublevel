import { ErrorState } from '../../../components/feedback/ErrorState';
import { PageContainer } from '../layout/PageContainer';

export function AccessDeniedPlaceholder() {
  return (
    <PageContainer
      title="Acesso negado"
      description="Seu papel atual nao possui permissao para acessar esta area."
    >
      <ErrorState description="Se voce acredita que deveria ter acesso, solicite revisao para um administrador do HubLevel." />
    </PageContainer>
  );
}

import { EmptyState } from '../../../components/feedback/EmptyState';
import { PageContainer } from '../layout/PageContainer';

export function NotFoundPlaceholder() {
  return (
    <PageContainer title="Pagina nao encontrada" description="A rota solicitada nao existe no HubLevel.">
      <EmptyState
        title="Nada por aqui"
        description="Use a navegacao lateral para acessar uma area disponivel para o seu papel."
      />
    </PageContainer>
  );
}

import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card } from '../../../components/ui';

export function ClientHistoryEmptyState() {
  return (
    <Card>
      <EmptyState
        title="Nenhum evento encontrado"
        description="Tarefas, atualizacoes, reunioes, documentos e entregaveis deste cliente aparecerao aqui conforme forem criados."
      />
    </Card>
  );
}

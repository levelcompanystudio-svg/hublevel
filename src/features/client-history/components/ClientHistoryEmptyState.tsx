import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card } from '../../../components/ui';

export function ClientHistoryEmptyState() {
  return (
    <Card>
      <EmptyState
        title="Nenhum evento encontrado"
        description="Tarefas, atualizacoes, reunioes, documentos, entregaveis e o briefing de landing page deste cliente aparecerao aqui conforme forem criados."
      />
    </Card>
  );
}

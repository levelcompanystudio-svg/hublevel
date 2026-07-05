import { Badge, Button, Card } from '../../../components/ui';
import { DashboardSection } from '../components/DashboardSection';
import { MetricCard } from '../components/MetricCard';

const description = 'Implementacao prevista na etapa correspondente';

const metrics = [
  'Minhas Tarefas',
  'Tarefas Vencidas',
  'Minhas Reunioes',
];

export function CollaboratorDashboard() {
  return (
    <div className="space-y-6">
      <DashboardSection
        title="Minha rotina"
        description="Resumo individual de tarefas e reunioes atribuidas ao colaborador."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map((title) => (
            <MetricCard key={title} title={title} value={0} description={description} />
          ))}
        </div>
      </DashboardSection>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">Prioridades pessoais</h3>
              <Badge tone="brand">Colaborador</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Area preparada para destacar atividades pendentes sem expor financeiro, contratos ou clientes globais.
            </p>
          </div>
          <Button type="button" disabled>
            Em breve
          </Button>
        </div>
      </Card>
    </div>
  );
}

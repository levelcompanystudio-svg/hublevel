import { Badge, Button, Card } from '../../../components/ui';
import { DashboardSection } from '../components/DashboardSection';
import { MetricCard } from '../components/MetricCard';

const description = 'Implementacao prevista na etapa correspondente';

const metrics = [
  'Meus Clientes',
  'Clientes Sem Atualizacao',
  'Clientes Sem Reuniao',
  'Tarefas Vencidas',
  'Reunioes Da Semana',
];

export function ManagerDashboard() {
  return (
    <div className="space-y-6">
      <DashboardSection
        title="Minha carteira"
        description="Acompanhamento operacional dos clientes e atividades sob responsabilidade do gestor."
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
              <h3 className="text-sm font-semibold text-foreground">Foco operacional</h3>
              <Badge tone="brand">Gestor</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Area preparada para priorizar clientes sem acompanhamento recente, tarefas vencidas e reunioes da semana.
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

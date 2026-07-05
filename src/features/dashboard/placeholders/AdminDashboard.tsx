import { Badge, Button, Card } from '../../../components/ui';
import { DashboardSection } from '../components/DashboardSection';
import { MetricCard } from '../components/MetricCard';

const description = 'Implementacao prevista na etapa correspondente';

const metrics = [
  'Clientes Ativos',
  'Clientes Em Atraso',
  'Clientes Sem Atualizacao',
  'Clientes Sem Reuniao',
  'Receita Prevista',
  'Receita Recebida',
  'Tarefas Vencidas',
  'Reunioes Da Semana',
];

export function AdminDashboard() {
  return (
    <div className="space-y-6">
      <DashboardSection
        title="Visao administrativa"
        description="Indicadores globais de operacao, receita, clientes, tarefas e reunioes."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((title) => (
            <MetricCard key={title} title={title} value={0} description={description} />
          ))}
        </div>
      </DashboardSection>

      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-100">Resumo executivo</h3>
              <Badge tone="brand">Admin</Badge>
            </div>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Area preparada para consolidar alertas criticos, tendencias e acompanhamento financeiro quando os modulos forem implementados.
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

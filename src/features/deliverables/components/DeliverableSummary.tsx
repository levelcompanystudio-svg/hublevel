import { SummaryCard } from '../../../components/layout/SummaryCard';
import type { Deliverable } from '../deliverables.types';

interface DeliverableSummaryProps {
  items: Deliverable[];
}

function daysAgoDateOnly(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString().slice(0, 10);
}

export function DeliverableSummary({ items }: DeliverableSummaryProps) {
  const pendentes = items.filter((item) => item.status === 'pendente' || item.status === 'em_andamento').length;
  const concluidos = items.filter((item) => item.status === 'concluido').length;
  const vencidos = items.filter((item) => item.status === 'vencido').length;
  const recentThreshold = daysAgoDateOnly(30);
  const documentosRecentes = items.filter(
    (item) => item.origin === 'documento' && item.referenceDate !== null && item.referenceDate >= recentThreshold,
  ).length;

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <SummaryCard label="Total" value={items.length} tone="brand" />
      <SummaryCard label="Pendentes" value={pendentes} />
      <SummaryCard label="Concluidos" value={concluidos} tone="success" />
      <SummaryCard label="Vencidos" value={vencidos} tone="warning" />
      <SummaryCard label="Documentos recentes" value={documentosRecentes} />
    </div>
  );
}

import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card } from '../../../components/ui';
import { PageContainer } from '../layout/PageContainer';

interface ModulePlaceholderProps {
  title: string;
  description: string;
  upcoming: string[];
}

export function ModulePlaceholder({ title, description, upcoming }: ModulePlaceholderProps) {
  return (
    <PageContainer title={title} description={description}>
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <EmptyState
            title="Modulo em preparacao"
            description="Esta tela ja faz parte da navegacao do HubLevel, mas os dados reais serao implementados em uma etapa futura."
          />
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-100">Proximas entregas</h3>
          <ul className="mt-4 space-y-3 text-sm text-slate-400">
            {upcoming.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </PageContainer>
  );
}

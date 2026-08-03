import type { CrmOpportunity } from '../crm.types';

interface CrmOpportunityListProps {
  opportunities: CrmOpportunity[];
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

// Lista simples de oportunidades dentro de uma etapa - sem drag and drop, sem menu de acoes
// ainda (fora do escopo desta etapa). So leitura: titulo, valor quando existir e contato
// vinculado quando existir.
export function CrmOpportunityList({ opportunities }: CrmOpportunityListProps) {
  if (opportunities.length === 0) {
    return <p className="px-3 py-4 text-center text-xs text-muted-foreground">Nenhuma oportunidade nesta etapa.</p>;
  }

  return (
    <ul className="space-y-1.5">
      {opportunities.map((opportunity) => (
        <li key={opportunity.id} className="rounded-lg border border-border bg-surface p-2.5">
          <p className="truncate text-sm font-medium text-foreground">{opportunity.title}</p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="truncate text-xs text-muted-foreground">{opportunity.contact?.name ?? 'Sem contato'}</p>
            {opportunity.value !== null && (
              <p className="shrink-0 font-mono text-xs font-semibold tabular-nums text-foreground">{formatCurrency(opportunity.value)}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}

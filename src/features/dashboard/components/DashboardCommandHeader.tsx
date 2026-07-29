import { ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardCommandHeaderProps {
  userName?: string;
  activeClients: number;
  openTasks: number;
  healthyPercent: number | null;
  clientsNeedingAttention: number;
}

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

function firstName(name?: string): string {
  if (!name) return '';
  return name.trim().split(/\s+/)[0] ?? '';
}

// Area A do Dashboard V3 (Command Overview): uma linha compacta de contexto, nao um PageHeader
// tradicional. Sem caixa, sem sombra - so tipografia e um unico link de acao, quando ha algo que
// precisa de atencao.
export function DashboardCommandHeader({ userName, activeClients, openTasks, healthyPercent, clientsNeedingAttention }: DashboardCommandHeaderProps) {
  const name = firstName(userName);

  return (
    <div className="flex flex-col gap-3 border-b border-border/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-caption uppercase tracking-wide text-muted-foreground">{greeting()}{name ? `, ${name}` : ''}</p>
        <h1 className="mt-1 text-h1 text-foreground">Panorama da operacao</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {activeClients} clientes ativos - {openTasks} tarefas em aberto na carteira
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-4">
        {healthyPercent !== null && (
          <div className="flex items-center gap-2">
            <ShieldCheck className={`h-4 w-4 shrink-0 ${healthyPercent >= 70 ? 'text-success' : 'text-warning'}`} aria-hidden="true" />
            <div>
              <p className="font-mono text-sm font-semibold leading-none tabular-nums text-foreground">{healthyPercent}%</p>
              <p className="mt-0.5 text-xs leading-none text-muted-foreground">carteira saudavel</p>
            </div>
          </div>
        )}

        {clientsNeedingAttention > 0 ? (
          <Link
            to="/app/alertas"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            {clientsNeedingAttention} precisam de atencao
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        ) : (
          <span className="text-sm font-medium text-success">Tudo em dia</span>
        )}
      </div>
    </div>
  );
}

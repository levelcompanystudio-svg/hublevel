import { Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { emptyClientPerformanceMetrics } from '../performance.types';
import { PerformanceHeader } from '../components/PerformanceHeader';
import { PerformanceMetricsGrid } from '../components/PerformanceMetricsGrid';

export function PerformanceOverviewPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  if (!canAccess) return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-6">
      <PerformanceHeader
        title="Performance"
        description="Visao consolidada de investimento, leads e satisfacao. Preparada para receber integracoes futuras com Meta Ads, Google Ads e pesquisas de NPS."
      />

      <PerformanceMetricsGrid metrics={emptyClientPerformanceMetrics} />

      <Card>
        <h3 className="text-sm font-semibold text-foreground">Nenhuma integracao conectada ainda</h3>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          O HubLevel ainda nao tem uma fonte real de dados de performance paga ou de pesquisas de satisfacao.
          Esta tela e o espaco reservado para quando essas integracoes existirem: os indicadores acima (Investimento,
          Leads, CPL, ROAS, NPS) sao os mesmos exibidos na aba "Metricas" de cada cliente e passam a mostrar dados
          reais automaticamente assim que uma fonte for conectada. Nenhum numero e inventado enquanto isso.
        </p>
      </Card>
    </div>
  );
}

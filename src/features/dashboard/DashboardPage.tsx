import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui';
import { useAuth } from '../auth/useAuth';
import { CollaboratorDashboard } from './placeholders/CollaboratorDashboard';
import { ResultsDashboard } from './placeholders/ResultsDashboard';

export function DashboardPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Visao geral"
        title="Dashboard"
        description="Panorama geral de resultados: carteira ativa, saude dos clientes e desempenho de campanhas assim que integracoes forem conectadas."
      />

      {(role === 'admin' || role === 'gestor') && <ResultsDashboard />}
      {role === 'colaborador' && <CollaboratorDashboard />}
      {!role && (
        <Card>
          <p className="text-sm text-muted-foreground">Perfil sem papel de acesso carregado.</p>
        </Card>
      )}
    </div>
  );
}

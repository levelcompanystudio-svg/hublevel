import { PageHeader } from '../../components/layout/PageHeader';
import { Card } from '../../components/ui';
import { useAuth } from '../auth/useAuth';
import { AdminDashboard } from './placeholders/AdminDashboard';
import { CollaboratorDashboard } from './placeholders/CollaboratorDashboard';
import { ManagerDashboard } from './placeholders/ManagerDashboard';

export function DashboardPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Visao geral"
        title="Dashboard"
        description="Painel operacional por papel. Os indicadores permanecem zerados ate a implementacao dos modulos correspondentes."
      />

      {role === 'admin' && <AdminDashboard />}
      {role === 'gestor' && <ManagerDashboard />}
      {role === 'colaborador' && <CollaboratorDashboard />}
      {!role && (
        <Card>
          <p className="text-sm text-muted-foreground">Perfil sem papel de acesso carregado.</p>
        </Card>
      )}
    </div>
  );
}

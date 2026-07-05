import { Card } from '../../components/ui';
import { PageContainer } from '../app/layout/PageContainer';
import { useAuth } from '../auth/useAuth';
import { AdminDashboard } from './placeholders/AdminDashboard';
import { CollaboratorDashboard } from './placeholders/CollaboratorDashboard';
import { ManagerDashboard } from './placeholders/ManagerDashboard';

export function DashboardPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;

  return (
    <PageContainer
      title="Dashboard"
      description="Painel operacional por papel. Os indicadores permanecem zerados ate a implementacao dos modulos correspondentes."
    >
      {role === 'admin' && <AdminDashboard />}
      {role === 'gestor' && <ManagerDashboard />}
      {role === 'colaborador' && <CollaboratorDashboard />}
      {!role && (
        <Card>
          <p className="text-sm text-slate-500">Perfil sem papel de acesso carregado.</p>
        </Card>
      )}
    </PageContainer>
  );
}

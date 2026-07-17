import { PageHeader } from '../../../components/layout/PageHeader';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { AdminDashboard } from '../placeholders/AdminDashboard';

export function AdminDashboardPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;

  if (role !== 'admin') return <AccessDeniedPlaceholder />;

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gestao"
        title="Painel administrativo"
        description="Indicadores administrativos e financeiros globais: receita, clientes em atraso, tarefas e reunioes."
      />
      <AdminDashboard />
    </div>
  );
}

import React, { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../features/app/layout/AppLayout';
import { NotFoundPlaceholder } from '../features/app/placeholders/NotFoundPlaceholder';
import { InactiveAccountPage } from '../features/auth/InactiveAccountPage';
import { LoginPage } from '../features/auth/LoginPage';
import { useAuth } from '../features/auth/useAuth';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ProtectedRoute } from './ProtectedRoute';

// Paginas atras do ProtectedRoute/AppLayout viram chunks separados (React.lazy) - so uma delas
// carrega por vez, dependendo da rota visitada. Exports nomeados (nao default), entao cada import
// precisa do adaptador `.then((m) => ({ default: m.NomeDaPagina }))`. Dashboard fica eager (linha
// 84) por ser a tela imediatamente seguinte ao login; login/auth/shell tambem ficam eager (ver
// AppLayout.tsx para o <Suspense> que envolve o <Outlet />).
const AdminDashboardPage = lazy(() =>
  import('../features/dashboard/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const ClientListPage = lazy(() =>
  import('../features/clients/pages/ClientListPage').then((m) => ({ default: m.ClientListPage })),
);
const ClientFormPage = lazy(() =>
  import('../features/clients/pages/ClientFormPage').then((m) => ({ default: m.ClientFormPage })),
);
const ClientDetailsPage = lazy(() =>
  import('../features/clients/pages/ClientDetailsPage').then((m) => ({ default: m.ClientDetailsPage })),
);
const ContractListPage = lazy(() =>
  import('../features/contracts/pages/ContractListPage').then((m) => ({ default: m.ContractListPage })),
);
const ContractFormPage = lazy(() =>
  import('../features/contracts/pages/ContractFormPage').then((m) => ({ default: m.ContractFormPage })),
);
const ContractDetailsPage = lazy(() =>
  import('../features/contracts/pages/ContractDetailsPage').then((m) => ({ default: m.ContractDetailsPage })),
);
const FinanceListPage = lazy(() =>
  import('../features/finance/pages/FinanceListPage').then((m) => ({ default: m.FinanceListPage })),
);
const FinanceFormPage = lazy(() =>
  import('../features/finance/pages/FinanceFormPage').then((m) => ({ default: m.FinanceFormPage })),
);
const FinanceDetailsPage = lazy(() =>
  import('../features/finance/pages/FinanceDetailsPage').then((m) => ({ default: m.FinanceDetailsPage })),
);
const TaskListPage = lazy(() =>
  import('../features/tasks/pages/TaskListPage').then((m) => ({ default: m.TaskListPage })),
);
const TaskFormPage = lazy(() =>
  import('../features/tasks/pages/TaskFormPage').then((m) => ({ default: m.TaskFormPage })),
);
const TaskDetailsPage = lazy(() =>
  import('../features/tasks/pages/TaskDetailsPage').then((m) => ({ default: m.TaskDetailsPage })),
);
const UpdateListPage = lazy(() =>
  import('../features/updates/pages/UpdateListPage').then((m) => ({ default: m.UpdateListPage })),
);
const UpdateFormPage = lazy(() =>
  import('../features/updates/pages/UpdateFormPage').then((m) => ({ default: m.UpdateFormPage })),
);
const UpdateDetailsPage = lazy(() =>
  import('../features/updates/pages/UpdateDetailsPage').then((m) => ({ default: m.UpdateDetailsPage })),
);
const MeetingConsolePage = lazy(() =>
  import('../features/meetings/pages/MeetingConsolePage').then((m) => ({ default: m.MeetingConsolePage })),
);
const MeetingFormPage = lazy(() =>
  import('../features/meetings/pages/MeetingFormPage').then((m) => ({ default: m.MeetingFormPage })),
);
const MeetingDetailsPage = lazy(() =>
  import('../features/meetings/pages/MeetingDetailsPage').then((m) => ({ default: m.MeetingDetailsPage })),
);
const DocumentListPage = lazy(() =>
  import('../features/documents/pages/DocumentListPage').then((m) => ({ default: m.DocumentListPage })),
);
const DocumentFormPage = lazy(() =>
  import('../features/documents/pages/DocumentFormPage').then((m) => ({ default: m.DocumentFormPage })),
);
const DocumentDetailsPage = lazy(() =>
  import('../features/documents/pages/DocumentDetailsPage').then((m) => ({ default: m.DocumentDetailsPage })),
);
const AlertListPage = lazy(() =>
  import('../features/alerts/pages/AlertListPage').then((m) => ({ default: m.AlertListPage })),
);
const DeliverableListPage = lazy(() =>
  import('../features/deliverables/pages/DeliverableListPage').then((m) => ({ default: m.DeliverableListPage })),
);
const DeliverableFormPage = lazy(() =>
  import('../features/deliverables/pages/DeliverableFormPage').then((m) => ({ default: m.DeliverableFormPage })),
);
const DeliverableDetailsPage = lazy(() =>
  import('../features/deliverables/pages/DeliverableDetailsPage').then((m) => ({ default: m.DeliverableDetailsPage })),
);
const PerformanceOverviewPage = lazy(() =>
  import('../features/performance/pages/PerformanceOverviewPage').then((m) => ({ default: m.PerformanceOverviewPage })),
);
const IntegrationsOverviewPage = lazy(() =>
  import('../features/integrations/pages/IntegrationsOverviewPage').then((m) => ({ default: m.IntegrationsOverviewPage })),
);
const SettingsPage = lazy(() =>
  import('../features/settings/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })),
);

export const AppRoutes: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-primary" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user && profile?.status === 'active' ? (
            <Navigate to="/app/dashboard" replace />
          ) : user && profile?.status === 'inactive' ? (
            <Navigate to="/inactive" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      <Route
        path="/inactive"
        element={
          <ProtectedRoute allowInactive={true}>
            <InactiveAccountPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="painel-administrativo" element={<AdminDashboardPage />} />
        <Route path="clientes" element={<ClientListPage />} />
        <Route path="clientes/novo" element={<ClientFormPage />} />
        <Route path="clientes/:id" element={<ClientDetailsPage />} />
        <Route path="clientes/:id/editar" element={<ClientFormPage />} />
        <Route path="contratos" element={<ContractListPage />} />
        <Route path="contratos/novo" element={<ContractFormPage />} />
        <Route path="contratos/:id" element={<ContractDetailsPage />} />
        <Route path="contratos/:id/editar" element={<ContractFormPage />} />
        <Route path="financeiro" element={<FinanceListPage />} />
        <Route path="financeiro/novo" element={<FinanceFormPage />} />
        <Route path="financeiro/:id" element={<FinanceDetailsPage />} />
        <Route path="financeiro/:id/editar" element={<FinanceFormPage />} />
        <Route path="tarefas" element={<TaskListPage />} />
        <Route path="tarefas/novo" element={<TaskFormPage />} />
        <Route path="tarefas/:id" element={<TaskDetailsPage />} />
        <Route path="tarefas/:id/editar" element={<TaskFormPage />} />
        <Route path="acompanhamento" element={<UpdateListPage />} />
        <Route path="acompanhamento/novo" element={<UpdateFormPage />} />
        <Route path="acompanhamento/:id" element={<UpdateDetailsPage />} />
        <Route path="acompanhamento/:id/editar" element={<UpdateFormPage />} />
        <Route path="reunioes" element={<MeetingConsolePage />} />
        <Route path="reunioes/novo" element={<MeetingFormPage />} />
        <Route path="reunioes/:id" element={<MeetingDetailsPage />} />
        <Route path="reunioes/:id/editar" element={<MeetingFormPage />} />
        <Route path="documentos" element={<DocumentListPage />} />
        <Route path="documentos/novo" element={<DocumentFormPage />} />
        <Route path="documentos/:id" element={<DocumentDetailsPage />} />
        <Route path="documentos/:id/editar" element={<DocumentFormPage />} />
        <Route path="alertas" element={<AlertListPage />} />
        <Route path="entregaveis" element={<DeliverableListPage />} />
        <Route path="entregaveis/novo" element={<DeliverableFormPage />} />
        <Route path="entregaveis/:id" element={<DeliverableDetailsPage />} />
        <Route path="entregaveis/:id/editar" element={<DeliverableFormPage />} />
        <Route path="performance" element={<PerformanceOverviewPage />} />
        <Route path="integracoes" element={<IntegrationsOverviewPage />} />
        <Route path="configuracoes" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPlaceholder />} />
      </Route>

      <Route
        path="*"
        element={
          user ? (
            profile?.status === 'inactive' ? (
              <Navigate to="/inactive" replace />
            ) : (
              <Navigate to="/app/dashboard" replace />
            )
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
};

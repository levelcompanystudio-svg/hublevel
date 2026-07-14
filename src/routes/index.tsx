import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../features/app/layout/AppLayout';
import { canAccessPath } from '../features/app/navigation/navigation.config';
import { AccessDeniedPlaceholder } from '../features/app/placeholders/AccessDeniedPlaceholder';
import { ModulePlaceholder } from '../features/app/placeholders/ModulePlaceholder';
import { NotFoundPlaceholder } from '../features/app/placeholders/NotFoundPlaceholder';
import { InactiveAccountPage } from '../features/auth/InactiveAccountPage';
import { LoginPage } from '../features/auth/LoginPage';
import { useAuth } from '../features/auth/useAuth';
import { ClientDetailsPage } from '../features/clients/pages/ClientDetailsPage';
import { ClientFormPage } from '../features/clients/pages/ClientFormPage';
import { ClientListPage } from '../features/clients/pages/ClientListPage';
import { ContractDetailsPage } from '../features/contracts/pages/ContractDetailsPage';
import { ContractFormPage } from '../features/contracts/pages/ContractFormPage';
import { ContractListPage } from '../features/contracts/pages/ContractListPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { FinanceDetailsPage } from '../features/finance/pages/FinanceDetailsPage';
import { FinanceFormPage } from '../features/finance/pages/FinanceFormPage';
import { FinanceListPage } from '../features/finance/pages/FinanceListPage';
import { MeetingDetailsPage } from '../features/meetings/pages/MeetingDetailsPage';
import { MeetingFormPage } from '../features/meetings/pages/MeetingFormPage';
import { MeetingListPage } from '../features/meetings/pages/MeetingListPage';
import { ServiceDetailsPage } from '../features/services/pages/ServiceDetailsPage';
import { ServiceFormPage } from '../features/services/pages/ServiceFormPage';
import { ServiceListPage } from '../features/services/pages/ServiceListPage';
import { TaskDetailsPage } from '../features/tasks/pages/TaskDetailsPage';
import { TaskFormPage } from '../features/tasks/pages/TaskFormPage';
import { TaskListPage } from '../features/tasks/pages/TaskListPage';
import { UpdateDetailsPage } from '../features/updates/pages/UpdateDetailsPage';
import { UpdateFormPage } from '../features/updates/pages/UpdateFormPage';
import { UpdateListPage } from '../features/updates/pages/UpdateListPage';
import { ProtectedRoute } from './ProtectedRoute';

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
        <Route path="clientes" element={<ClientListPage />} />
        <Route path="clientes/novo" element={<ClientFormPage />} />
        <Route path="clientes/:id" element={<ClientDetailsPage />} />
        <Route path="clientes/:id/editar" element={<ClientFormPage />} />
        <Route path="servicos" element={<ServiceListPage />} />
        <Route path="servicos/novo" element={<ServiceFormPage />} />
        <Route path="servicos/:id" element={<ServiceDetailsPage />} />
        <Route path="servicos/:id/editar" element={<ServiceFormPage />} />
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
        <Route path="reunioes" element={<MeetingListPage />} />
        <Route path="reunioes/novo" element={<MeetingFormPage />} />
        <Route path="reunioes/:id" element={<MeetingDetailsPage />} />
        <Route path="reunioes/:id/editar" element={<MeetingFormPage />} />
        <Route path="configuracoes" element={<RolePage path="/app/configuracoes" page="configuracoes" />} />
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

type PlaceholderPage = 'configuracoes';

const placeholderContent: Record<PlaceholderPage, {
  title: string;
  description: string;
  upcoming: string[];
}> = {
  configuracoes: {
    title: 'Configuracoes',
    description: 'Parametros e administracao do HubLevel.',
    upcoming: ['Usuarios', 'Fontes de aquisicao', 'Catalogos controlados'],
  },
};

function RolePage({ path, page }: { path: string; page: PlaceholderPage }) {
  const { profile } = useAuth();
  const content = placeholderContent[page];

  if (!canAccessPath(profile?.roles?.name, path)) {
    return <AccessDeniedPlaceholder />;
  }

  return <ModulePlaceholder {...content} />;
}

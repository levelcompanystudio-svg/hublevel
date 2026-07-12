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
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-slate-950">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
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
        <Route path="servicos" element={<RolePage path="/app/servicos" page="servicos" />} />
        <Route path="contratos" element={<RolePage path="/app/contratos" page="contratos" />} />
        <Route path="financeiro" element={<RolePage path="/app/financeiro" page="financeiro" />} />
        <Route path="tarefas" element={<RolePage path="/app/tarefas" page="tarefas" />} />
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

type PlaceholderPage =
  | 'clientes'
  | 'servicos'
  | 'contratos'
  | 'financeiro'
  | 'tarefas'
  | 'configuracoes';

const placeholderContent: Record<PlaceholderPage, {
  title: string;
  description: string;
  upcoming: string[];
}> = {
  clientes: {
    title: 'Clientes',
    description: 'Gestao da carteira de clientes e responsaveis.',
    upcoming: ['Listagem por papel', 'Cadastro de cliente', 'Detalhe operacional'],
  },
  servicos: {
    title: 'Servicos',
    description: 'Catalogo de servicos e vinculos com clientes.',
    upcoming: ['Catalogo administrativo', 'Servicos contratados', 'Status por cliente'],
  },
  contratos: {
    title: 'Contratos',
    description: 'Controle administrativo de contratos. Area restrita a Admin.',
    upcoming: ['Vigencia', 'Aviso previo', 'Documentos vinculados'],
  },
  financeiro: {
    title: 'Financeiro',
    description: 'Controle financeiro administrativo. Area restrita a Admin.',
    upcoming: ['Cobrancas', 'Pagamentos', 'Resumo de receita'],
  },
  tarefas: {
    title: 'Tarefas',
    description: 'Execucao operacional da equipe.',
    upcoming: ['Minhas tarefas', 'Filtros por status', 'Atualizacao de progresso'],
  },
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

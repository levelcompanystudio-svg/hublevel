import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { LoginPage } from '../features/auth/LoginPage';
import { InactiveAccountPage } from '../features/auth/InactiveAccountPage';
import { AppShellPlaceholder } from '../features/app/AppShellPlaceholder';
import { DashboardPlaceholder } from '../features/app/DashboardPlaceholder';
import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-screen bg-slate-950">
        <svg className="animate-spin h-10 w-10 text-indigo-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    );
  }

  return (
    <Routes>
      {/* Rota de login público */}
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

      {/* Rota de conta inativa */}
      <Route
        path="/inactive"
        element={
          <ProtectedRoute allowInactive={true}>
            <InactiveAccountPage />
          </ProtectedRoute>
        }
      />

      {/* Rotas protegidas da aplicação */}
      <Route
        path="/app"
        element={
          <ProtectedRoute>
            <AppShellPlaceholder />
          </ProtectedRoute>
        }
      >
        <Route path="dashboard" element={<DashboardPlaceholder />} />
        {/* Redirecionar /app para /app/dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Rota padrão (fallback) */}
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

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import type { ProfileType } from '../features/auth/auth.types';
import { useAuth } from '../features/auth/useAuth';
import { getPostAuthRedirect } from './authRedirects';

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowInactive?: boolean;
  requireProfileType?: ProfileType;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowInactive = false,
  requireProfileType,
}) => {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <svg className="h-10 w-10 animate-spin text-primary" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span className="text-sm font-semibold text-muted-foreground">Verificando sessao...</span>
        </div>
      </div>
    );
  }

  // Se nao estiver autenticado OU nao tiver perfil valido, redireciona para login.
  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Se a conta for inativa e nao permitimos inativos nesta rota, redireciona para /inactive.
  if (profile.status === 'inactive' && !allowInactive) {
    return <Navigate to="/inactive" replace />;
  }

  // Se a conta for ativa mas tentamos acessar uma rota exclusiva para inativos (/inactive).
  if (profile.status === 'active' && allowInactive) {
    return <Navigate to={getPostAuthRedirect(profile)} replace />;
  }

  // Isolamento interno/externo: usuario externo nao acessa /app/*, usuario interno nao acessa
  // a area do cliente (/cliente). getPostAuthRedirect manda cada um para o seu proprio "home".
  if (requireProfileType && profile.profile_type !== requireProfileType) {
    return <Navigate to={getPostAuthRedirect(profile)} replace />;
  }

  return children;
};

import type { UserProfile } from '../features/auth/auth.types';

// Unico lugar que decide "para onde um usuario autenticado deve ir" - usado tanto por
// AppRoutes (rota /login e fallback "*") quanto por ProtectedRoute (redirecionamentos por
// status/profile_type), para as duas pontas nunca divergirem e criarem um loop de redirect.
export function getPostAuthRedirect(profile: UserProfile | null | undefined): string {
  if (!profile) return '/login';
  if (profile.status === 'inactive') return '/inactive';
  if (profile.profile_type === 'external') return '/cliente';
  return '/app/dashboard';
}

import React from 'react';
import { useAuth } from '../auth/useAuth';

// Placeholder provisorio para profile_type = 'external' (rota /cliente). O portal de cliente
// real ainda nao existe; isto so garante que o usuario externo nao caia em /app/*.
export const ExternalAccessPlaceholder: React.FC = () => {
  const { profile, signOut, loading } = useAuth();

  return (
    <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-pulse-glow absolute -right-40 -top-40 h-96 w-96 rounded-full opacity-20"
          style={{
            background: 'radial-gradient(circle, var(--color-brand-500), transparent 70%)',
          }}
        />
        <div
          className="animate-pulse-glow absolute -bottom-32 -left-32 h-80 w-80 rounded-full opacity-15"
          style={{
            background: 'radial-gradient(circle, var(--color-brand-400), transparent 70%)',
            animationDelay: '1.5s',
          }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in text-center">
        <div className="mb-6 flex justify-center">
          <div
            className="animate-float flex h-16 w-16 items-center justify-center rounded-full border border-dashed"
            style={{
              borderColor: 'var(--color-primary)',
              backgroundColor: 'oklch(0.70 0.15 300 / 0.08)',
            }}
          >
            <span className="text-base font-semibold tracking-tight">HL</span>
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-bold tracking-tight">Area do cliente em preparacao</h1>

        <p className="mx-auto mb-8 max-w-sm text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          {profile?.name ? `Ola, ${profile.name}. ` : ''}
          O portal do cliente HubLevel ainda esta sendo construido. Em breve voce tera acesso aqui
          aos dados da sua empresa. Por enquanto, nao ha nada para fazer nesta area.
        </p>

        <div className="glass w-full rounded-2xl p-6">
          <button
            onClick={() => void signOut()}
            disabled={loading}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-semibold transition duration-200 disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: 'var(--color-surface-base)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border-default)',
            }}
          >
            {loading ? (
              <>
                <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <span>Saindo...</span>
              </>
            ) : (
              'Sair'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

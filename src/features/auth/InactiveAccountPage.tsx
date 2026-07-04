import React from 'react';
import { useAuth } from './useAuth';

export const InactiveAccountPage: React.FC = () => {
  const { signOut, loading } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 relative min-h-screen">
      {/* Background decorations */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-pulse-glow absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-20"
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

      <div className="relative z-10 w-full max-w-md text-center animate-fade-in">
        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div
            className="animate-float flex h-16 w-16 items-center justify-center rounded-full border border-dashed"
            style={{
              borderColor: 'var(--color-warning)',
              backgroundColor: 'oklch(0.80 0.15 80 / 0.05)',
            }}
          >
            <span className="text-3xl text-amber-400">⚠️</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold tracking-tight mb-3">
          Conta Inativa
        </h1>

        <p className="text-sm mb-8 max-w-sm mx-auto" style={{ color: 'var(--color-text-secondary)' }}>
          Esta conta de usuário está desativada no momento. Por favor, entre em contato com o administrador do HubLevel para reativar seu acesso.
        </p>

        {/* Card containing actions */}
        <div className="glass w-full rounded-2xl p-6">
          <button
            onClick={() => signOut()}
            disabled={loading}
            className="w-full font-semibold rounded-lg py-3 px-4 transition duration-200 cursor-pointer flex items-center justify-center gap-2 border text-sm"
            style={{
              backgroundColor: 'var(--color-surface-base)',
              color: 'var(--color-text-primary)',
              borderColor: 'var(--color-border-default)',
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Saindo...</span>
              </>
            ) : (
              'Voltar para o Login'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

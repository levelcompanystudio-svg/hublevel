import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../auth/useAuth';

export const AppShellPlaceholder: React.FC = () => {
  const { profile, signOut, loading } = useAuth();

  return (
    <div className="flex flex-1 flex-col min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <header className="glass sticky top-0 z-40 w-full border-b" style={{ borderColor: 'var(--color-border-subtle)' }}>
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 border border-indigo-500/30">
              <svg
                width="20"
                height="20"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4L4 12v16l16 8 16-8V12L20 4z"
                  stroke="var(--color-brand-400)"
                  strokeWidth="2"
                  fill="none"
                />
                <circle
                  cx="20"
                  cy="20"
                  r="4"
                  fill="var(--color-brand-400)"
                />
              </svg>
            </div>
            <span className="font-bold tracking-tight text-lg" style={{
              background: 'linear-gradient(135deg, var(--color-brand-300), var(--color-brand-500))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              HubLevel
            </span>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-200">{profile?.name || 'Usuário'}</p>
              <p className="text-[10px] text-slate-400 capitalize font-mono">{profile?.roles?.name || 'Carregando...'}</p>
            </div>

            <button
              onClick={() => signOut()}
              disabled={loading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg transition border hover:bg-slate-900 cursor-pointer"
              style={{
                color: 'var(--color-text-primary)',
                borderColor: 'var(--color-border-default)',
              }}
            >
              {loading ? 'Saindo...' : 'Sair'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Body - Renders active child route */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-6 py-8">
        <Outlet />
      </main>
    </div>
  );
};

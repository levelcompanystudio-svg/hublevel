import React from 'react';
import { useAuth } from '../auth/useAuth';

export const DashboardPlaceholder: React.FC = () => {
  const { profile } = useAuth();

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Bem-vindo de volta ao ambiente interno do HubLevel.
        </p>
      </div>

      {/* Dashboard Cards Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* User profile card */}
        <div className="glass rounded-xl p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Informações da Sessão</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm border-b pb-4 border-slate-900">
              <div>
                <p className="text-xs font-medium text-slate-500">NOME DO USUÁRIO</p>
                <p className="font-semibold mt-1">{profile?.name || 'Carregando...'}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">ENDEREÇO DE E-MAIL</p>
                <p className="font-semibold mt-1">{profile?.email || 'Carregando...'}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs font-medium text-slate-500">NÍVEL DE PERMISSÃO / ROLE</p>
                <p className="mt-1">
                  <span className="inline-flex items-center rounded-md bg-indigo-500/10 px-2 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20 capitalize font-mono">
                    {profile?.roles?.name || 'Nenhum'}
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500">STATUS DA CONTA</p>
                <p className="mt-1">
                  <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20 capitalize">
                    {profile?.status || 'Carregando...'}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* System status placeholder */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Módulos Internos</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-400 border border-slate-900 rounded-lg p-2.5 bg-slate-950/40">
              <span>Clientes</span>
              <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-500">Em breve</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border border-slate-900 rounded-lg p-2.5 bg-slate-950/40">
              <span>Serviços & Contratos</span>
              <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-500">Em breve</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border border-slate-900 rounded-lg p-2.5 bg-slate-950/40">
              <span>Operações & Tarefas</span>
              <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-500">Em breve</span>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 border border-slate-900 rounded-lg p-2.5 bg-slate-950/40">
              <span>Financeiro</span>
              <span className="text-[10px] font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-500">Em breve</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

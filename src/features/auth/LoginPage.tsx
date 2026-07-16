import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      await signIn(email, password);
      navigate('/app/dashboard', { replace: true });
    } catch (err: unknown) {
      console.error('Error signing in:', err);
      if (err instanceof Error) {
        if (err.message === 'Invalid login credentials') {
          setErrorMsg('Credenciais invalidas. Verifique seu e-mail e senha.');
        } else {
          setErrorMsg(err.message);
        }
      } else {
        setErrorMsg('Erro ao realizar login. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-1 flex-col items-center justify-center bg-background px-6 py-12 text-foreground">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div
          className="animate-pulse-glow absolute -top-40 -right-40 h-96 w-96 rounded-full opacity-30"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent 70%)' }}
        />
        <div
          className="animate-pulse-glow absolute -bottom-32 -left-32 h-80 w-80 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, var(--color-primary), transparent 70%)', animationDelay: '1.5s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="animate-float mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/30 bg-gradient-to-br from-primary to-primary/60 text-xl font-bold text-primary-foreground shadow-[0_0_40px_-6px_var(--color-primary)]">
            HL
          </div>
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            <span
              style={{
                background: 'linear-gradient(135deg, color-mix(in oklch, var(--color-primary) 70%, white), var(--color-primary))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              HubLevel
            </span>
          </h1>
          <p className="text-sm text-muted-foreground">Acesse sua central operacional</p>
        </div>

        <div className="glass w-full rounded-2xl p-8 shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_24px_48px_-20px_rgba(0,0,0,0.7)]">
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
                <span className="font-bold">!</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="seu.email@hublevel.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg border border-border bg-background/60 px-4 py-3 text-sm text-foreground shadow-[inset_0_1px_2px_rgba(0,0,0,0.25)] outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-60"
                placeholder="********"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg border border-primary/60 bg-gradient-to-b from-primary to-primary/85 px-4 py-3 text-sm font-semibold text-primary-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.15)_inset,0_10px_24px_-8px_var(--color-primary)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Entrando...</span>
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

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
      // O redirect será disparado de acordo com o estado do perfil do usuário logado.
      // Mas podemos redirecionar explicitamente para /app/dashboard se tudo der certo
      navigate('/app/dashboard', { replace: true });
    } catch (err: unknown) {
      console.error('Error signing in:', err);
      if (err instanceof Error) {
        if (err.message === 'Invalid login credentials') {
          setErrorMsg('Credenciais inválidas. Verifique seu e-mail e senha.');
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

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* Brand logo & title */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="animate-float glass flex h-16 w-16 items-center justify-center rounded-2xl mb-4">
            <svg
              width="32"
              height="32"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M20 4L4 12v16l16 8 16-8V12L20 4z"
                stroke="var(--color-brand-400)"
                strokeWidth="2"
                fill="none"
              />
              <path
                d="M20 4v16m0 0L4 12m16 8l16-8M20 20v16"
                stroke="var(--color-brand-500)"
                strokeWidth="1.5"
                opacity="0.6"
              />
              <circle
                cx="20"
                cy="20"
                r="4"
                fill="var(--color-brand-400)"
                opacity="0.8"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">
            <span
              style={{
                background: 'linear-gradient(135deg, var(--color-brand-300), var(--color-brand-500))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              HubLevel
            </span>
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Faça login na plataforma interna de gestão
          </p>
        </div>

        {/* Card containing login form */}
        <div className="glass w-full rounded-2xl p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {errorMsg && (
              <div
                className="rounded-lg p-4 text-sm flex gap-2 items-start border"
                style={{
                  backgroundColor: 'oklch(0.65 0.20 25 / 0.1)',
                  borderColor: 'var(--color-error)',
                  color: 'var(--color-error)',
                }}
              >
                <span className="font-bold">⚠️</span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                E-mail
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg px-4 py-3 outline-none text-sm border focus:ring-2 focus:ring-offset-2 transition"
                style={{
                  backgroundColor: 'oklch(0.13 0.01 260 / 0.5)',
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                }}
                placeholder="seu.email@hublevel.com"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold uppercase tracking-wider mb-2"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                Senha
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="w-full rounded-lg px-4 py-3 outline-none text-sm border focus:ring-2 focus:ring-offset-2 transition"
                style={{
                  backgroundColor: 'oklch(0.13 0.01 260 / 0.5)',
                  borderColor: 'var(--color-border-subtle)',
                  color: 'var(--color-text-primary)',
                  boxShadow: 'inset 0 1px 2px rgba(0, 0, 0, 0.2)',
                }}
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full font-semibold rounded-lg py-3 px-4 transition duration-200 cursor-pointer flex items-center justify-center gap-2 border text-sm"
              style={{
                backgroundColor: loading ? 'oklch(0.28 0.10 250 / 0.5)' : 'var(--color-brand-600)',
                color: 'white',
                borderColor: 'var(--color-brand-500)',
              }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
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

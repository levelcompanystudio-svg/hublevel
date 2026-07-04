/**
 * HubLevel - App Shell
 *
 * Temporary initial screen showing the app is ready for development.
 * This is NOT a landing page or marketing page.
 */

function App() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <div className="relative z-10 flex max-w-lg flex-col items-center text-center">
        <div className="animate-fade-in mb-8">
          <div className="animate-float glass flex h-20 w-20 items-center justify-center rounded-2xl">
            <svg
              width="40"
              height="40"
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
        </div>

        <h1 className="animate-fade-in-delay mb-3 text-4xl font-bold tracking-tight">
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

        <p className="animate-fade-in-delay-2 mb-8 text-lg" style={{ color: 'var(--color-text-secondary)' }}>
          Ambiente pronto para desenvolvimento
        </p>

        <div className="animate-fade-in-delay-3 glass w-full rounded-xl p-6">
          <div className="mb-4 flex items-center gap-3">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: 'var(--color-success)' }}
            />
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Sistema operacional
            </span>
          </div>

          <div className="space-y-3 text-left text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: 'oklch(0.13 0.01 260 / 0.5)' }}>
              <span>React + TypeScript</span>
              <span className="font-mono text-xs" style={{ color: 'var(--color-brand-400)' }}>OK</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: 'oklch(0.13 0.01 260 / 0.5)' }}>
              <span>Vite</span>
              <span className="font-mono text-xs" style={{ color: 'var(--color-brand-400)' }}>OK</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: 'oklch(0.13 0.01 260 / 0.5)' }}>
              <span>Tailwind CSS</span>
              <span className="font-mono text-xs" style={{ color: 'var(--color-brand-400)' }}>OK</span>
            </div>
            <div className="flex items-center justify-between rounded-lg px-3 py-2" style={{ backgroundColor: 'oklch(0.13 0.01 260 / 0.5)' }}>
              <span>Supabase Client</span>
              <span className="font-mono text-xs" style={{ color: 'var(--color-brand-400)' }}>OK</span>
            </div>
          </div>
        </div>

        <p className="animate-fade-in-delay-3 mt-6 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Etapa 1 concluida - Base do frontend configurada
        </p>
      </div>
    </div>
  );
}

export default App;

import type { ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  className?: string;
  density?: 'default' | 'compact';
}

// Superficie sem borda/sombra para agrupar conteudo relacionado sem introduzir mais uma caixa
// com contorno. Usar Card quando o item precisa de contorno proprio (linha em grid, item
// clicavel); usar Panel para regioes/secoes que so precisam se distinguir do fundo por camada.
export function Panel({ children, className = '', density = 'default' }: PanelProps) {
  return (
    <section className={`rounded-xl bg-surface ${density === 'compact' ? 'p-3' : 'p-4'} text-foreground ${className}`}>
      {children}
    </section>
  );
}

import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = '', elevated = false }: CardProps) {
  return (
    <section
      className={`relative rounded-xl border border-border ${elevated ? 'bg-card-elevated' : 'bg-card'} shadow-soft p-4 text-card-foreground ${className}`}
    >
      {children}
    </section>
  );
}

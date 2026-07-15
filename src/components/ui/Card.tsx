import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
}

export function Card({ children, className = '', elevated = false }: CardProps) {
  return (
    <section
      className={`relative rounded-xl border border-border ${elevated ? 'bg-card-elevated' : 'bg-card'} p-5 text-card-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_16px_32px_-18px_rgba(0,0,0,0.65)] ${className}`}
    >
      {children}
    </section>
  );
}

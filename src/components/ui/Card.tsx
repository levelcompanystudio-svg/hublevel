import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  elevated?: boolean;
  density?: 'default' | 'compact';
}

export function Card({ children, className = '', elevated = false, density = 'default' }: CardProps) {
  return (
    <section
      className={`relative rounded-xl border border-border ${elevated ? 'bg-card-elevated' : 'bg-card'} shadow-soft ${density === 'compact' ? 'p-3' : 'p-4'} text-card-foreground ${className}`}
    >
      {children}
    </section>
  );
}

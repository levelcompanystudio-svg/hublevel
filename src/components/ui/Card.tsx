import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section className={`rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm shadow-black/10 ${className}`}>
      {children}
    </section>
  );
}

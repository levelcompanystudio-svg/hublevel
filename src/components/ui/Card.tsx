import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section className={`rounded-lg border border-slate-800 bg-slate-950/60 p-5 shadow-sm ${className}`}>
      {children}
    </section>
  );
}

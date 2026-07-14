import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <section
      className={`relative rounded-xl border border-border bg-card p-5 text-card-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_12px_28px_-16px_rgba(0,0,0,0.5)] ${className}`}
    >
      {children}
    </section>
  );
}

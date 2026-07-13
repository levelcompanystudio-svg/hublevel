import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'success';
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  const tones = {
    neutral: 'border-border bg-muted text-muted-foreground',
    brand: 'border-primary/40 bg-primary/15 text-foreground',
    success: 'border-success/40 bg-success/15 text-foreground',
  };

  return (
    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}>
      {children}
    </span>
  );
}

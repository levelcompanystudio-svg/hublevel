import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'success' | 'warning' | 'destructive';
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  const tones = {
    neutral: 'border-border bg-muted text-muted-foreground',
    brand: 'border-primary/40 bg-primary/15 text-foreground',
    success: 'border-success/40 bg-success/15 text-success',
    warning: 'border-warning/40 bg-warning/15 text-warning',
    destructive: 'border-destructive/40 bg-destructive/15 text-destructive',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      {children}
    </span>
  );
}

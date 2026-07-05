import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  tone?: 'neutral' | 'brand' | 'success';
}

export function Badge({ children, tone = 'neutral' }: BadgeProps) {
  const tones = {
    neutral: 'border-slate-800 bg-slate-900 text-slate-300',
    brand: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
    success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
  };

  return (
    <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

import type { ReactNode } from 'react';

interface StatsGridProps {
  children: ReactNode;
  className?: string;
}

export function StatsGrid({ children, className = '' }: StatsGridProps) {
  return <div className={`grid gap-3 sm:grid-cols-2 xl:grid-cols-4 ${className}`}>{children}</div>;
}

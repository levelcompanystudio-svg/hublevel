import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card px-6 py-6 shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_12px_28px_-16px_rgba(0,0,0,0.5)]">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

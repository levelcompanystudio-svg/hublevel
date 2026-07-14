import type { ReactNode } from 'react';

interface DashboardSectionProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function DashboardSection({ title, description, children }: DashboardSectionProps) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </section>
  );
}

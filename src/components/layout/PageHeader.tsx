import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-start lg:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-caption mb-1 uppercase tracking-wide text-primary">{eyebrow}</p>}
        <h2 className="text-h1 text-foreground">{title}</h2>
        <p className="mt-1.5 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

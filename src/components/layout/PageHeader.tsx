import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description: string;
  eyebrow?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, eyebrow, action }: PageHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card px-6 py-6 text-card-foreground shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_12px_28px_-16px_rgba(0,0,0,0.5)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(480px circle at 0% 0%, color-mix(in oklch, var(--primary) 14%, transparent), transparent 65%)',
        }}
      />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-primary">
              {eyebrow}
            </p>
          )}
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-[1.75rem]">{title}</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}

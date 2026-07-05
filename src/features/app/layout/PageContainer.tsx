import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {children}
    </div>
  );
}

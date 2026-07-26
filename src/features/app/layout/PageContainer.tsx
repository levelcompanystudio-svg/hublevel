import type { ReactNode } from 'react';

interface PageContainerProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function PageContainer({ title, description, children }: PageContainerProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-border pb-5">
        <h2 className="text-h1 text-foreground">{title}</h2>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  );
}

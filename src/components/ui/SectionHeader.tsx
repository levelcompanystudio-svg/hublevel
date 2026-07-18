import type { ReactNode } from 'react';

interface SectionHeaderProps {
  title: string;
  caption?: string;
  action?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, caption, action, className = '' }: SectionHeaderProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-2 ${className}`}>
      <div className="min-w-0">
        <h3 className="text-h3 text-foreground">{title}</h3>
        {caption && <p className="text-caption mt-0.5">{caption}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

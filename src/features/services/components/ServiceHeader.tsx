import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui';

interface ServiceHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export function ServiceHeader({ title, description, actionLabel, actionTo }: ServiceHeaderProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-card-elevated to-card px-6 py-5 shadow-[0_1px_0_0_rgba(255,255,255,0.05)_inset,0_16px_32px_-18px_rgba(0,0,0,0.65)]">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          background:
            'radial-gradient(420px circle at 0% 0%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 65%)',
        }}
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p>
        </div>
        {actionLabel && actionTo && (
          <Link to={actionTo}>
            <Button type="button" variant="primary">
              {actionLabel}
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

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
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-100">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-500">{description}</p>
      </div>
      {actionLabel && actionTo && (
        <Link to={actionTo}>
          <Button type="button" variant="primary">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}

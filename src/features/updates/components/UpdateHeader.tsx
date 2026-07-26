import { Link } from 'react-router-dom';
import { Button } from '../../../components/ui';

interface UpdateHeaderProps {
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
}

export function UpdateHeader({ title, description, actionLabel, actionTo }: UpdateHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <h2 className="text-h1 truncate text-foreground">{title}</h2>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">{description}</p>
      </div>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="shrink-0">
          <Button type="button" variant="primary">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}

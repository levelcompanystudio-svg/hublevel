import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import { COLABORADOR_ALLOWED_STATUSES } from '../deliverables.types';
import type { DeliverableStatus } from '../deliverables.types';
import { deliverableStatusLabels } from './DeliverableStatusBadge';

interface DeliverableStatusUpdateFormProps {
  status: DeliverableStatus;
  loading?: boolean;
  onChange: (status: DeliverableStatus) => void;
  onSubmit: () => void;
}

export function DeliverableStatusUpdateForm({ status, loading = false, onChange, onSubmit }: DeliverableStatusUpdateFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h3 className="text-sm font-semibold text-foreground">Atualizar status</h3>
        <p className="mt-1 text-xs text-muted-foreground">Voce pode marcar este entregavel como em andamento ou entregue.</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <select value={status} onChange={(event) => onChange(event.target.value as DeliverableStatus)} className={inputClassName}>
            {COLABORADOR_ALLOWED_STATUSES.map((value) => (
              <option key={value} value={value}>{deliverableStatusLabels[value]}</option>
            ))}
          </select>
          <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar status'}</Button>
        </div>
      </Card>
    </form>
  );
}

const inputClassName = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary sm:max-w-xs';

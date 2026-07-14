import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { TaskStatus } from '../tasks.types';

interface TaskStatusUpdateFormProps {
  status: TaskStatus;
  loading?: boolean;
  onChange: (status: TaskStatus) => void;
  onSubmit: () => void;
}

export function TaskStatusUpdateForm({ status, loading = false, onChange, onSubmit }: TaskStatusUpdateFormProps) {
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h3 className="text-sm font-semibold text-foreground">Atualizar status</h3>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row">
          <select value={status} onChange={(event) => onChange(event.target.value as TaskStatus)} className={inputClassName}>
            <option value="a_fazer">Pendente</option>
            <option value="em_andamento">Em andamento</option>
            <option value="aguardando_cliente">Aguardando cliente</option>
            <option value="em_revisao">Em revisao</option>
            <option value="concluida">Concluida</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <Button type="submit" variant="primary" disabled={loading}>{loading ? 'Salvando...' : 'Salvar status'}</Button>
        </div>
      </Card>
    </form>
  );
}

const inputClassName = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary sm:max-w-xs';

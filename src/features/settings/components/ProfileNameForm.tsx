import { useState, type FormEvent } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Badge, Button, Card } from '../../../components/ui';
import { updateOwnName } from '../settings.api';

interface ProfileNameFormProps {
  profileId: string;
  currentName: string;
  email: string;
  onUpdated: (name: string) => void;
}

export function ProfileNameForm({ profileId, currentName, email, onUpdated }: ProfileNameFormProps) {
  const [name, setName] = useState(currentName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError('Informe um nome valido.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await updateOwnName(profileId, name);
      onUpdated(name.trim());
      setSavedAt(Date.now());
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar nome.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">Minha conta</h3>
        <Badge tone="brand">Voce</Badge>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{email}</p>

      <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="block flex-1">
          <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Nome</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
            disabled={saving}
          />
        </label>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Salvando...' : 'Salvar nome'}
        </Button>
      </form>

      {savedAt && !error && (
        <p className="mt-3 text-xs text-success">Nome atualizado com sucesso.</p>
      )}
      {error && (
        <div className="mt-3">
          <ErrorState description={error} />
        </div>
      )}
    </Card>
  );
}

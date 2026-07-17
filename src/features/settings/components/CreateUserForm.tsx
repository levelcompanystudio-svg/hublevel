import { useState, type FormEvent } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Badge, Button, Card } from '../../../components/ui';
import type { CreateUserValues, ManagedProfile } from '../settings.types';
import { createUser } from '../settings.api';

interface CreateUserFormProps {
  onCreated: (profile: ManagedProfile) => void;
}

const initialValues: CreateUserValues = {
  name: '',
  email: '',
  password: '',
};

export function CreateUserForm({ onCreated }: CreateUserFormProps) {
  const [values, setValues] = useState<CreateUserValues>(initialValues);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  function setField<K extends keyof CreateUserValues>(key: K, value: CreateUserValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.name.trim() || !values.email.trim() || values.password.length < 6) {
      setError('Informe nome, e-mail e uma senha temporaria com pelo menos 6 caracteres.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const profile = await createUser(values);
      onCreated(profile);
      setCreatedEmail(profile.email);
      setValues(initialValues);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar usuario.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-foreground">Adicionar usuario</h3>
        <Badge tone="neutral">Novo usuario entra como colaborador</Badge>
      </div>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
        Cadastre o acesso no Supabase Auth. Depois de criado, ajuste o papel na tabela abaixo se precisar promover
        para Gestor ou Admin.
      </p>

      <form onSubmit={handleSubmit} className="mt-5 grid gap-3 lg:grid-cols-[1fr_1fr_220px_auto] lg:items-end">
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Nome</span>
          <input
            value={values.name}
            onChange={(event) => setField('name', event.target.value)}
            disabled={saving}
            className={inputClassName}
            placeholder="Nome do usuario"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">E-mail</span>
          <input
            type="email"
            value={values.email}
            onChange={(event) => setField('email', event.target.value)}
            disabled={saving}
            className={inputClassName}
            placeholder="email@empresa.com"
            required
          />
        </label>
        <label className="block">
          <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Senha temporaria</span>
          <input
            type="password"
            value={values.password}
            onChange={(event) => setField('password', event.target.value)}
            disabled={saving}
            minLength={6}
            className={inputClassName}
            placeholder="min. 6 caracteres"
            required
          />
        </label>
        <Button type="submit" variant="primary" disabled={saving}>
          {saving ? 'Cadastrando...' : 'Adicionar'}
        </Button>
      </form>

      {createdEmail && !error && (
        <p className="mt-3 text-xs text-success">Usuario {createdEmail} cadastrado com sucesso.</p>
      )}
      {error && (
        <div className="mt-3">
          <ErrorState description={error} />
        </div>
      )}
    </Card>
  );
}

const inputClassName = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground';

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Badge, Button } from '../../../components/ui';
import { createUser } from '../settings.api';
import type { CreateUserValues, ManagedProfile, RoleOption } from '../settings.types';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';

interface UserSettingsDrawerProps {
  open: boolean;
  mode: 'create' | 'edit';
  profile: ManagedProfile | null;
  roles: RoleOption[];
  currentUserId: string;
  saving: boolean;
  onClose: () => void;
  onCreated: (profile: ManagedProfile) => void;
  onRoleChange: (profileId: string, roleId: string) => void;
  onStatusToggle: (profileId: string, nextStatus: 'active' | 'inactive') => void;
  onDelete: (profileId: string) => void;
}

const initialValues: CreateUserValues = {
  name: '',
  email: '',
  password: '',
};

const inputClassName =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground';

function roleName(profile: ManagedProfile | null) {
  const role = Array.isArray(profile?.roles) ? profile?.roles[0] : profile?.roles;
  return role?.name;
}

export function UserSettingsDrawer({
  open,
  mode,
  profile,
  roles,
  currentUserId,
  saving,
  onClose,
  onCreated,
  onRoleChange,
  onStatusToggle,
  onDelete,
}: UserSettingsDrawerProps) {
  const [values, setValues] = useState<CreateUserValues>(initialValues);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProfile = profile;
  const isSelf = activeProfile?.id === currentUserId;
  const currentRole = roleName(activeProfile);
  const title = mode === 'create' ? 'Adicionar usuario' : 'Configurar usuario';

  const selectedRoleId = useMemo(() => activeProfile?.role_id ?? '', [activeProfile]);

  useEffect(() => {
    if (!open) {
      setValues(initialValues);
      setError(null);
    }
  }, [open]);

  if (!open) return null;

  function setField<K extends keyof CreateUserValues>(key: K, value: CreateUserValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!values.name.trim() || !values.email.trim() || values.password.length < 6) {
      setError('Informe nome, e-mail e uma senha temporaria com pelo menos 6 caracteres.');
      return;
    }

    try {
      setCreating(true);
      setError(null);
      const created = await createUser(values);
      onCreated(created);
      setValues(initialValues);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao cadastrar usuario.');
    } finally {
      setCreating(false);
    }
  }

  function handleDelete() {
    if (!activeProfile || isSelf) return;
    const confirmed = window.confirm(`Excluir o usuario ${activeProfile.name}? O acesso sera removido e ele saira da lista.`);
    if (confirmed) onDelete(activeProfile.id);
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Fechar" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl">
        <header className="border-b border-border px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {mode === 'create' ? 'Crie o acesso e ajuste o papel logo em seguida.' : 'Ajuste papel, status ou remova o acesso.'}
              </p>
            </div>
            <Button type="button" variant="ghost" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {mode === 'create' && !activeProfile && (
            <form onSubmit={handleCreate} className="space-y-4">
              <Field label="Nome">
                <input
                  value={values.name}
                  onChange={(event) => setField('name', event.target.value)}
                  disabled={creating}
                  className={inputClassName}
                  placeholder="Nome do usuario"
                  required
                />
              </Field>
              <Field label="E-mail">
                <input
                  type="email"
                  value={values.email}
                  onChange={(event) => setField('email', event.target.value)}
                  disabled={creating}
                  className={inputClassName}
                  placeholder="email@empresa.com"
                  required
                />
              </Field>
              <Field label="Senha temporaria">
                <input
                  type="password"
                  value={values.password}
                  onChange={(event) => setField('password', event.target.value)}
                  disabled={creating}
                  minLength={6}
                  className={inputClassName}
                  placeholder="min. 6 caracteres"
                  required
                />
              </Field>
              <div className="grid">
                <Button type="submit" variant="primary" disabled={creating}>
                  {creating ? 'Criando...' : 'Criar usuario'}
                </Button>
              </div>
            </form>
          )}

          {activeProfile && (
            <div className="space-y-5">
              <div className="rounded-lg border border-border bg-surface/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{activeProfile.name}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{activeProfile.email}</p>
                  </div>
                  {isSelf && <Badge tone="brand">Voce</Badge>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {currentRole && <UserRoleBadge role={currentRole} />}
                  <UserStatusBadge status={activeProfile.status} />
                </div>
              </div>

              <Field label="Papel">
                <select
                  value={selectedRoleId}
                  disabled={saving || isSelf}
                  title={isSelf ? 'Voce nao pode alterar seu proprio papel' : undefined}
                  onChange={(event) => onRoleChange(activeProfile.id, event.target.value)}
                  className={inputClassName}
                >
                  {roles.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </Field>

              <div className="rounded-lg border border-border bg-surface/40 p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Acesso</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={saving || isSelf}
                    title={isSelf ? 'Voce nao pode alterar o status da propria conta' : undefined}
                    onClick={() => onStatusToggle(activeProfile.id, activeProfile.status === 'active' ? 'inactive' : 'active')}
                  >
                    {activeProfile.status === 'active' ? 'Inativar usuario' : 'Ativar usuario'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={saving || isSelf}
                    title={isSelf ? 'Voce nao pode excluir sua propria conta' : undefined}
                    onClick={handleDelete}
                  >
                    Excluir usuario
                  </Button>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mt-4">
              <ErrorState description={error} />
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

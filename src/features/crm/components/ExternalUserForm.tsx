import { useState, type FormEvent, type ReactNode } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { Button } from '../../../components/ui';
import { createExternalClientUser, linkExistingExternalUser, searchExternalProfiles } from '../externalAccess.api';
import type { ExternalMembershipRole, ExternalProfileSearchResult } from '../externalAccess.types';
import { EXTERNAL_MEMBERSHIP_ROLE_OPTIONS } from './ExternalMembershipRoleBadge';

interface ExternalUserFormProps {
  clientId: string;
  userId: string;
  existingProfileIds: string[];
  onClose: () => void;
  onSaved: () => void;
}

type FormMode = 'new' | 'existing';

const inputClassName =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground';

// Drawer com dois modos: criar um usuario externo novo (Auth + profile + membership via Edge
// Function create-external-client-user, service role nunca chega ao frontend) ou vincular um
// usuario externo ja existente a este cliente (insert direto em client_user_memberships,
// permitido pela RLS de admin/gestor das migrations 031/032). Sem exclusao definitiva - Ativar/
// inativar/suspender fica na tabela, apos o vinculo criado.
export function ExternalUserForm({ clientId, userId, existingProfileIds, onClose, onSaved }: ExternalUserFormProps) {
  const [mode, setMode] = useState<FormMode>('new');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<ExternalMembershipRole>('client_viewer');

  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<ExternalProfileSearchResult[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<ExternalProfileSearchResult | null>(null);

  async function handleSearch() {
    setSelectedProfile(null);
    setError(null);
    try {
      setSearching(true);
      const found = await searchExternalProfiles(query);
      setResults(found.filter((profile) => !existingProfileIds.includes(profile.id)));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar usuarios externos.');
    } finally {
      setSearching(false);
    }
  }

  async function handleCreateNew(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!name.trim() || !email.trim() || password.length < 6) {
      setError('Informe nome, e-mail e uma senha temporaria com pelo menos 6 caracteres.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await createExternalClientUser({ client_id: clientId, name: name.trim(), email: email.trim(), password, membership_role: role });
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar o usuario externo.');
    } finally {
      setSaving(false);
    }
  }

  async function handleLinkExisting(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProfile) {
      setError('Selecione um usuario externo na busca.');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await linkExistingExternalUser({ client_id: clientId, profile_id: selectedProfile.id, membership_role: role }, userId);
      onSaved();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao vincular o usuario externo.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Fechar" onClick={onClose} />
      <aside className="relative flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-soft">
        <header className="flex items-start justify-between gap-3 border-b border-border px-5 py-4">
          <div>
            <p className="text-sm font-semibold text-foreground">Adicionar acesso externo</p>
            <p className="mt-1 text-xs text-muted-foreground">Crie um novo usuario externo ou vincule um ja existente a este cliente.</p>
          </div>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving}>
            Fechar
          </Button>
        </header>

        <div className="border-b border-border px-5 py-3">
          <div className="inline-flex rounded-md border border-border bg-surface p-0.5">
            <button
              type="button"
              onClick={() => setMode('new')}
              disabled={saving}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${
                mode === 'new' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Novo usuario
            </button>
            <button
              type="button"
              onClick={() => setMode('existing')}
              disabled={saving}
              className={`rounded px-3 py-1.5 text-xs font-semibold transition-colors duration-150 disabled:cursor-not-allowed ${
                mode === 'existing' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Usuario existente
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          {mode === 'new' ? (
            <form onSubmit={handleCreateNew} className="space-y-4">
              <Field label="Nome">
                <input value={name} onChange={(event) => setName(event.target.value)} disabled={saving} className={inputClassName} placeholder="Nome do usuario" required />
              </Field>
              <Field label="E-mail">
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={saving} className={inputClassName} placeholder="email@cliente.com" required />
              </Field>
              <Field label="Senha temporaria">
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={saving}
                  minLength={6}
                  className={inputClassName}
                  placeholder="min. 6 caracteres"
                  required
                />
              </Field>
              <Field label="Papel">
                <select value={role} onChange={(event) => setRole(event.target.value as ExternalMembershipRole)} disabled={saving} className={inputClassName}>
                  {EXTERNAL_MEMBERSHIP_ROLE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>

              {error && <ErrorState description={error} />}

              <Button type="submit" variant="primary" disabled={saving} className="w-full">
                {saving ? 'Criando...' : 'Criar e vincular usuario'}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleLinkExisting} className="space-y-4">
              <Field label="Buscar por nome ou e-mail">
                <div className="flex gap-2">
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    disabled={saving}
                    className={inputClassName}
                    placeholder="min. 3 caracteres"
                  />
                  <Button type="button" variant="secondary" onClick={() => void handleSearch()} disabled={saving || searching || query.trim().length < 3}>
                    {searching ? 'Buscando...' : 'Buscar'}
                  </Button>
                </div>
              </Field>

              {results.length > 0 && (
                <div className="space-y-1.5">
                  {results.map((profile) => (
                    <button
                      key={profile.id}
                      type="button"
                      onClick={() => setSelectedProfile(profile)}
                      className={`block w-full rounded-md border px-3 py-2 text-left text-sm transition-colors ${
                        selectedProfile?.id === profile.id ? 'border-primary bg-primary/10' : 'border-border bg-background hover:bg-card-elevated'
                      }`}
                    >
                      <p className="font-medium text-foreground">{profile.name}</p>
                      <p className="text-xs text-muted-foreground">{profile.email}</p>
                    </button>
                  ))}
                </div>
              )}

              {selectedProfile && (
                <Field label="Papel">
                  <select value={role} onChange={(event) => setRole(event.target.value as ExternalMembershipRole)} disabled={saving} className={inputClassName}>
                    {EXTERNAL_MEMBERSHIP_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </Field>
              )}

              {error && <ErrorState description={error} />}

              <Button type="submit" variant="primary" disabled={saving || !selectedProfile} className="w-full">
                {saving ? 'Vinculando...' : 'Vincular usuario'}
              </Button>
            </form>
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

import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { listProfiles, listRoles, updateProfileRole, updateProfileStatus } from '../settings.api';
import type { ManagedProfile, RoleOption } from '../settings.types';
import { CreateUserForm } from '../components/CreateUserForm';
import { ProfileNameForm } from '../components/ProfileNameForm';
import { UserTable } from '../components/UserTable';

export function SettingsPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  // Decisao desta etapa: apenas Admin acessa /app/configuracoes.
  // A RLS ja permite Gestor ler perfis ativos minimos ("gestor can read minimal
  // active profiles"), mas a instrucao pede MVP restrito a Admin ate nova decisao.
  const canAccess = role === 'admin';

  const [profiles, setProfiles] = useState<ManagedProfile[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [ownName, setOwnName] = useState(profile?.name ?? '');

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }
    let active = true;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [profileRows, roleRows] = await Promise.all([listProfiles(), listRoles()]);
        if (!active) return;
        setProfiles(profileRows);
        setRoles(roleRows);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar usuarios.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => {
      active = false;
    };
  }, [canAccess]);

  async function handleRoleChange(profileId: string, roleId: string) {
    try {
      setSavingId(profileId);
      setError(null);
      await updateProfileRole(profileId, roleId);
      setProfiles((current) =>
        current.map((item) => (item.id === profileId ? { ...item, role_id: roleId, roles: roles.find((r) => r.id === roleId) } : item)),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar papel do usuario.');
    } finally {
      setSavingId(null);
    }
  }

  async function handleStatusToggle(profileId: string, nextStatus: 'active' | 'inactive') {
    try {
      setSavingId(profileId);
      setError(null);
      await updateProfileStatus(profileId, nextStatus);
      setProfiles((current) =>
        current.map((item) => (item.id === profileId ? { ...item, status: nextStatus } : item)),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status do usuario.');
    } finally {
      setSavingId(null);
    }
  }

  if (!canAccess) {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Administracao"
        title="Configuracoes"
        description="Gestao de usuarios, papeis e status de acesso ao HubLevel."
      />

      {profile && (
        <ProfileNameForm
          profileId={profile.id}
          currentName={ownName}
          email={profile.email}
          onUpdated={(name) => {
            setOwnName(name);
            setProfiles((current) => current.map((item) => (item.id === profile.id ? { ...item, name } : item)));
          }}
        />
      )}

      {!loading && !error && (
        <CreateUserForm
          onCreated={(createdProfile) => {
            setProfiles((current) => [createdProfile, ...current].sort((a, b) => a.name.localeCompare(b.name)));
          }}
        />
      )}

      {loading && <LoadingState title="Carregando usuarios" />}
      {error && <ErrorState description={error} />}
      {!loading && !error && profile && (
        <UserTable
          profiles={profiles}
          roles={roles}
          currentUserId={profile.id}
          savingId={savingId}
          onRoleChange={(profileId, roleId) => void handleRoleChange(profileId, roleId)}
          onStatusToggle={(profileId, nextStatus) => void handleStatusToggle(profileId, nextStatus)}
        />
      )}
    </div>
  );
}

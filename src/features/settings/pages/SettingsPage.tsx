import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { PageHeader } from '../../../components/layout/PageHeader';
import { Button, Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { deleteUser, listProfiles, listRoles, updateProfileRole, updateProfileStatus } from '../settings.api';
import type { ManagedProfile, RoleOption } from '../settings.types';
import { ProfileNameForm } from '../components/ProfileNameForm';
import { UserTable } from '../components/UserTable';
import { UserSettingsDrawer } from '../components/UserSettingsDrawer';

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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'create' | 'edit'>('create');
  const [selectedProfile, setSelectedProfile] = useState<ManagedProfile | null>(null);

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
        current.map((item) => {
          if (item.id !== profileId) return item;
          const next = { ...item, role_id: roleId, roles: roles.find((r) => r.id === roleId) };
          setSelectedProfile((selected) => (selected?.id === profileId ? next : selected));
          return next;
        }),
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
        current.map((item) => {
          if (item.id !== profileId) return item;
          const next = { ...item, status: nextStatus };
          setSelectedProfile((selected) => (selected?.id === profileId ? next : selected));
          return next;
        }),
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar status do usuario.');
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(profileId: string) {
    try {
      setSavingId(profileId);
      setError(null);
      await deleteUser(profileId);
      setProfiles((current) => current.filter((item) => item.id !== profileId));
      setSelectedProfile(null);
      setDrawerOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir usuario.');
    } finally {
      setSavingId(null);
    }
  }

  function openCreateDrawer() {
    setDrawerMode('create');
    setSelectedProfile(null);
    setDrawerOpen(true);
  }

  function openEditDrawer(managedProfile: ManagedProfile) {
    setDrawerMode('edit');
    setSelectedProfile(managedProfile);
    setDrawerOpen(true);
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
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Usuarios</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Adicione usuarios e configure papel/status em uma janela dedicada.
              </p>
            </div>
            <Button type="button" variant="primary" onClick={openCreateDrawer}>
              Adicionar usuario
            </Button>
          </div>
        </Card>
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
          onConfigure={openEditDrawer}
        />
      )}

      {profile && (
        <UserSettingsDrawer
          open={drawerOpen}
          mode={drawerMode}
          profile={selectedProfile}
          roles={roles}
          currentUserId={profile.id}
          saving={Boolean(savingId)}
          onClose={() => setDrawerOpen(false)}
          onCreated={(createdProfile) => {
            setProfiles((current) => [createdProfile, ...current].sort((a, b) => a.name.localeCompare(b.name)));
            setSelectedProfile(createdProfile);
          }}
          onRoleChange={(profileId, roleId) => void handleRoleChange(profileId, roleId)}
          onStatusToggle={(profileId, nextStatus) => void handleStatusToggle(profileId, nextStatus)}
          onDelete={(profileId) => void handleDelete(profileId)}
        />
      )}
    </div>
  );
}

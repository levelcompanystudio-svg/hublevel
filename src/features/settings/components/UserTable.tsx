import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { ManagedProfile, RoleOption } from '../settings.types';
import { UserRoleBadge } from './UserRoleBadge';
import { UserStatusBadge } from './UserStatusBadge';

interface UserTableProps {
  profiles: ManagedProfile[];
  roles: RoleOption[];
  currentUserId: string;
  savingId: string | null;
  onRoleChange: (profileId: string, roleId: string) => void;
  onStatusToggle: (profileId: string, nextStatus: 'active' | 'inactive') => void;
}

function roleName(profile: ManagedProfile) {
  const role = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
  return role?.name;
}

export function UserTable({ profiles, roles, currentUserId, savingId, onRoleChange, onStatusToggle }: UserTableProps) {
  if (profiles.length === 0) {
    return (
      <Card>
        <EmptyState title="Nenhum usuario encontrado" description="Os usuarios cadastrados no HubLevel aparecerao aqui." />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Nome</th>
              <th className="px-5 py-3.5 font-semibold">Email</th>
              <th className="px-5 py-3.5 font-semibold">Papel</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {profiles.map((profile) => {
              const isSelf = profile.id === currentUserId;
              const isSaving = savingId === profile.id;
              const currentRole = roleName(profile);

              return (
                <tr key={profile.id} className="bg-card transition-colors hover:bg-card-elevated">
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-foreground">{profile.name}</p>
                    {isSelf && <p className="mt-1 text-xs text-muted-foreground">Voce</p>}
                  </td>
                  <td className="px-5 py-4 text-sm text-muted-foreground">{profile.email}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {currentRole && <UserRoleBadge role={currentRole} />}
                      <select
                        value={profile.role_id}
                        disabled={isSaving || isSelf}
                        title={isSelf ? 'Voce nao pode alterar seu proprio papel' : undefined}
                        onChange={(event) => onRoleChange(profile.id, event.target.value)}
                        className="rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none transition focus:border-primary disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {roles.map((role) => (
                          <option key={role.id} value={role.id}>
                            {role.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-5 py-4"><UserStatusBadge status={profile.status} /></td>
                  <td className="px-5 py-4">
                    <div className="flex justify-end">
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={isSaving || isSelf}
                        title={isSelf ? 'Voce nao pode inativar sua propria conta' : undefined}
                        onClick={() => onStatusToggle(profile.id, profile.status === 'active' ? 'inactive' : 'active')}
                      >
                        {isSaving ? 'Salvando...' : profile.status === 'active' ? 'Inativar' : 'Ativar'}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

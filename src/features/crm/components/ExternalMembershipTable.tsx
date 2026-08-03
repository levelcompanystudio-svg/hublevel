import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card } from '../../../components/ui';
import type { ExternalMembership, ExternalMembershipRole, ExternalMembershipStatus } from '../externalAccess.types';
import { EXTERNAL_MEMBERSHIP_ROLE_OPTIONS, ExternalMembershipRoleBadge } from './ExternalMembershipRoleBadge';
import { EXTERNAL_MEMBERSHIP_STATUS_OPTIONS, ExternalMembershipStatusBadge } from './ExternalMembershipStatusBadge';

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0][0] ?? '';
  const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}

interface ExternalMembershipTableProps {
  memberships: ExternalMembership[];
  canManage: boolean;
  savingMembershipId: string | null;
  onRoleChange: (membershipId: string, role: ExternalMembershipRole) => void;
  onStatusChange: (membershipId: string, status: ExternalMembershipStatus) => void;
}

const selectClassName =
  'rounded-md border border-border bg-background px-2 py-1 text-xs text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:opacity-60';

// Tabela de usuarios externos vinculados ao cliente. Papel e status sao trocados via select
// inline (mesmo padrao de "botao rapido" usado em CrmOpportunityList) - sem drag and drop, sem
// exclusao definitiva (inativar/suspender cobre o pedido de bloquear acesso).
export function ExternalMembershipTable({
  memberships,
  canManage,
  savingMembershipId,
  onRoleChange,
  onStatusChange,
}: ExternalMembershipTableProps) {
  if (memberships.length === 0) {
    return (
      <EmptyState
        title="Nenhum usuario externo vinculado"
        description="Crie um novo usuario externo ou vincule um usuario existente para dar acesso ao portal deste cliente."
      />
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="divide-y divide-border">
        {memberships.map((membership) => {
          const saving = savingMembershipId === membership.id;
          const name = membership.profile?.name ?? 'Usuario sem perfil visivel';
          return (
            <div key={membership.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <div
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted text-xs font-semibold text-muted-foreground"
                  aria-hidden="true"
                >
                  {initials(name)}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{name}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{membership.profile?.email ?? '-'}</p>
                </div>
              </div>

              {canManage ? (
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <select
                    value={membership.membership_role}
                    disabled={saving}
                    onChange={(event) => onRoleChange(membership.id, event.target.value as ExternalMembershipRole)}
                    className={selectClassName}
                    aria-label={`Papel de ${name}`}
                  >
                    {EXTERNAL_MEMBERSHIP_ROLE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={membership.status}
                    disabled={saving}
                    onChange={(event) => onStatusChange(membership.id, event.target.value as ExternalMembershipStatus)}
                    className={selectClassName}
                    aria-label={`Status de ${name}`}
                  >
                    {EXTERNAL_MEMBERSHIP_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-2">
                  <ExternalMembershipRoleBadge role={membership.membership_role} />
                  <ExternalMembershipStatusBadge status={membership.status} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

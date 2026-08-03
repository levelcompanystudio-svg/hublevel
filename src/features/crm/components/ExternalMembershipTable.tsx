import { EmptyState } from '../../../components/feedback/EmptyState';
import { Card } from '../../../components/ui';
import type { ExternalMembership, ExternalMembershipRole, ExternalMembershipStatus } from '../externalAccess.types';
import { EXTERNAL_MEMBERSHIP_ROLE_OPTIONS } from './ExternalMembershipRoleBadge';
import { EXTERNAL_MEMBERSHIP_STATUS_OPTIONS } from './ExternalMembershipStatusBadge';

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
          return (
            <div key={membership.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{membership.profile?.name ?? 'Usuario sem perfil visivel'}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">{membership.profile?.email ?? '-'}</p>
              </div>

              {canManage ? (
                <div className="flex shrink-0 items-center gap-2">
                  <select
                    value={membership.membership_role}
                    disabled={saving}
                    onChange={(event) => onRoleChange(membership.id, event.target.value as ExternalMembershipRole)}
                    className={selectClassName}
                    aria-label={`Papel de ${membership.profile?.name ?? 'usuario'}`}
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
                    aria-label={`Status de ${membership.profile?.name ?? 'usuario'}`}
                  >
                    {EXTERNAL_MEMBERSHIP_STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  {EXTERNAL_MEMBERSHIP_ROLE_OPTIONS.find((option) => option.value === membership.membership_role)?.label}
                  {' - '}
                  {EXTERNAL_MEMBERSHIP_STATUS_OPTIONS.find((option) => option.value === membership.status)?.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}

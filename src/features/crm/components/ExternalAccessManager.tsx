import { useCallback, useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, SectionHeader } from '../../../components/ui';
import {
  listClientExternalMemberships,
  updateExternalMembershipRole,
  updateExternalMembershipStatus,
} from '../externalAccess.api';
import type { ExternalMembership, ExternalMembershipRole, ExternalMembershipStatus } from '../externalAccess.types';
import { ExternalMembershipTable } from './ExternalMembershipTable';
import { ExternalUserForm } from './ExternalUserForm';

interface ExternalAccessManagerProps {
  clientId: string;
  canManage: boolean;
  userId: string;
}

// Secao "Acesso do cliente" na aba CRM (Etapa 9): lista os usuarios externos vinculados a este
// cliente e permite criar/vincular/trocar papel/ativar-inativar-suspender, sem permissao fina por
// oportunidade (fora de escopo desta etapa). Leitura e trocas de papel/status usam
// externalAccess.api.ts direto (RLS de admin/gestor das migrations 031/032); criar usuario novo
// passa pela Edge Function create-external-client-user, unico ponto que usa service role.
export function ExternalAccessManager({ clientId, canManage, userId }: ExternalAccessManagerProps) {
  const [memberships, setMemberships] = useState<ExternalMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingMembershipId, setSavingMembershipId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await listClientExternalMemberships(clientId);
      setMemberships(result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar o acesso externo deste cliente.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function handleRoleChange(membershipId: string, role: ExternalMembershipRole) {
    try {
      setSavingMembershipId(membershipId);
      setError(null);
      await updateExternalMembershipRole(membershipId, role, userId);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar o papel do vinculo.');
    } finally {
      setSavingMembershipId(null);
    }
  }

  async function handleStatusChange(membershipId: string, status: ExternalMembershipStatus) {
    try {
      setSavingMembershipId(membershipId);
      setError(null);
      await updateExternalMembershipStatus(membershipId, status, userId);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar o status do vinculo.');
    } finally {
      setSavingMembershipId(null);
    }
  }

  function handleSaved() {
    setFormOpen(false);
    void load();
  }

  return (
    <div className="space-y-3">
      <SectionHeader
        title="Acesso do cliente"
        caption={`${memberships.length} ${memberships.length === 1 ? 'usuario externo vinculado' : 'usuarios externos vinculados'}`}
        action={
          canManage && (
            <Button type="button" variant="secondary" size="sm" onClick={() => setFormOpen(true)}>
              Adicionar acesso
            </Button>
          )
        }
      />

      {loading ? (
        <LoadingState title="Carregando acesso externo" />
      ) : error ? (
        <ErrorState description={error} />
      ) : (
        <ExternalMembershipTable
          memberships={memberships}
          canManage={canManage}
          savingMembershipId={savingMembershipId}
          onRoleChange={(membershipId, role) => void handleRoleChange(membershipId, role)}
          onStatusChange={(membershipId, status) => void handleStatusChange(membershipId, status)}
        />
      )}

      {formOpen && (
        <ExternalUserForm
          clientId={clientId}
          userId={userId}
          existingProfileIds={memberships.map((membership) => membership.profile_id)}
          onClose={() => setFormOpen(false)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

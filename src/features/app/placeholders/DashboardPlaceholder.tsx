import { Card } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { PageContainer } from '../layout/PageContainer';

export function DashboardPlaceholder() {
  const { profile } = useAuth();

  return (
    <PageContainer
      title="Dashboard"
      description="Visao inicial autenticada. Indicadores reais serao implementados na etapa de dashboard."
    >
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <Card>
          <h3 className="text-sm font-semibold text-slate-100">Sessao atual</h3>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <InfoItem label="Nome" value={profile?.name ?? 'Carregando'} />
            <InfoItem label="Email" value={profile?.email ?? 'Carregando'} />
            <InfoItem label="Papel" value={profile?.roles?.name ?? 'Sem papel'} />
            <InfoItem label="Status" value={profile?.status ?? 'Carregando'} />
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-semibold text-slate-100">Escopo atual</h3>
          <p className="mt-3 text-sm text-slate-500">
            Layout principal, navegacao por papel e placeholders. Nenhuma query de negocio foi adicionada.
          </p>
        </Card>
      </div>
    </PageContainer>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-800 bg-slate-900/60 p-3">
      <p className="text-xs font-medium uppercase text-slate-500">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-slate-100">{value}</p>
    </div>
  );
}

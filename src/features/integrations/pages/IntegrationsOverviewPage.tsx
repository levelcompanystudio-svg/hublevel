import { Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { INTEGRATION_PROVIDERS } from '../integrations.types';
import { IntegrationHeader } from '../components/IntegrationHeader';
import { IntegrationsGrid } from '../components/IntegrationsGrid';

export function IntegrationsOverviewPage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  if (!canAccess) return <AccessDeniedPlaceholder />;

  const integrations = INTEGRATION_PROVIDERS.map((provider) => ({ provider, status: 'nao_conectado' as const }));

  return (
    <div className="space-y-6">
      <IntegrationHeader
        title="Integracoes"
        description="Espaco preparado para conectar Meta Ads, Google Ads, CRM/Leads e WhatsApp. Nenhuma conexao real existe ainda."
      />

      <IntegrationsGrid integrations={integrations} />

      <Card>
        <h3 className="text-sm font-semibold text-foreground">Nenhuma integracao conectada</h3>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Esta tela nao se conecta a nenhuma API externa: sem OAuth, sem token, sem chamada de rede. E o espaco
          visual e conceitual reservado para quando a Level Company decidir conectar de verdade cada canal.
          As integracoes por cliente aparecem na aba "Integracoes" do detalhe de cada cliente, usando os mesmos
          cartoes mostrados aqui.
        </p>
      </Card>
    </div>
  );
}

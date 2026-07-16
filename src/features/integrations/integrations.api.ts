import type { IntegrationInfo } from './integrations.types';
import { INTEGRATION_PROVIDERS } from './integrations.types';

// Nao existe nenhuma integracao real conectada (sem OAuth, sem token, sem chamada a API
// externa). Esta funcao e o contrato estavel que a UI consome hoje - todos os provedores
// retornam "nao_conectado". Quando uma integracao real for implementada (com migration,
// armazenamento seguro de credenciais e RLS proprios), esta funcao passa a consultar
// esse estado de verdade em vez de retornar a lista fixa abaixo.
export async function getClientIntegrations(_clientId: string): Promise<IntegrationInfo[]> {
  return INTEGRATION_PROVIDERS.map((provider) => ({ provider, status: 'nao_conectado' as const }));
}

import type { ClientPerformanceMetrics } from './performance.types';
import { emptyClientPerformanceMetrics } from './performance.types';

// Nao existe, no schema atual, nenhuma tabela com investimento, leads, CPL, ROAS ou NPS
// (nenhuma integracao Meta/Google/pesquisa esta conectada). Esta funcao e o contrato
// estavel que a UI consome hoje e que uma integracao futura devera implementar de verdade -
// por enquanto ela sempre resolve com metricas vazias, sem inventar numero nenhum.
export async function getClientPerformanceMetrics(_clientId: string): Promise<ClientPerformanceMetrics> {
  return emptyClientPerformanceMetrics;
}

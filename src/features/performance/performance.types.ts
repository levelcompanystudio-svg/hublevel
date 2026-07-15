export interface ClientPerformanceMetrics {
  investment: number | null;
  leads: number | null;
  cpl: number | null;
  roas: number | null;
  nps: number | null;
}

export const emptyClientPerformanceMetrics: ClientPerformanceMetrics = {
  investment: null,
  leads: null,
  cpl: null,
  roas: null,
  nps: null,
};

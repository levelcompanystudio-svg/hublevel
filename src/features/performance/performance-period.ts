export type PerformancePeriodPreset = 'this_month' | 'last_7_days' | 'last_30_days' | 'custom';

export interface PerformancePeriodRange {
  preset: PerformancePeriodPreset;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
}

function formatLocalDateOnly(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function todayDateOnly(): string {
  return formatLocalDateOnly(new Date());
}

function daysAgoDateOnly(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return formatLocalDateOnly(date);
}

function firstDayOfMonthDateOnly(): string {
  const date = new Date();
  date.setDate(1);
  return formatLocalDateOnly(date);
}

interface ResolvePerformancePeriodInput {
  preset: PerformancePeriodPreset;
  startDate?: string;
  endDate?: string;
}

// Unica fonte de verdade para transformar um preset (ou datas personalizadas) num range
// startDate/endDate concreto - usado tanto pelas queries em performance.api.ts quanto pelo
// PerformancePeriodFilter para saber o que mostrar/enviar.
export function resolvePerformancePeriodRange(input: ResolvePerformancePeriodInput): PerformancePeriodRange {
  const today = todayDateOnly();

  switch (input.preset) {
    case 'last_7_days':
      return { preset: 'last_7_days', startDate: daysAgoDateOnly(6), endDate: today };
    case 'this_month':
      return { preset: 'this_month', startDate: firstDayOfMonthDateOnly(), endDate: today };
    case 'custom': {
      const startDate = input.startDate ?? daysAgoDateOnly(29);
      const endDate = input.endDate ?? today;
      // Data final nunca pode ser menor que a inicial - se acontecer, inverte em vez de quebrar a query.
      if (endDate < startDate) {
        return { preset: 'custom', startDate: endDate, endDate: startDate };
      }
      return { preset: 'custom', startDate, endDate };
    }
    case 'last_30_days':
    default:
      return { preset: 'last_30_days', startDate: daysAgoDateOnly(29), endDate: today };
  }
}

export function getDefaultPerformancePeriod(): PerformancePeriodRange {
  return resolvePerformancePeriodRange({ preset: 'last_30_days' });
}

// Periodo imediatamente anterior, com a mesma duracao em dias do periodo atual - usado so para
// comparacao visual (mesma fonte real de dados, chamada de novo com datas deslocadas; nenhuma
// query ou calculo novo e introduzido).
export function getPreviousPeriodRange(period: PerformancePeriodRange): PerformancePeriodRange {
  const start = new Date(`${period.startDate}T00:00:00`);
  const end = new Date(`${period.endDate}T00:00:00`);
  const spanDays = Math.round((end.getTime() - start.getTime()) / 86_400_000);

  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  const previousStart = new Date(previousEnd);
  previousStart.setDate(previousStart.getDate() - spanDays);

  return { preset: 'custom', startDate: formatLocalDateOnly(previousStart), endDate: formatLocalDateOnly(previousEnd) };
}

function formatDateOnlyPtBr(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString('pt-BR');
}

export function formatPerformancePeriodLabel(period: PerformancePeriodRange): string {
  switch (period.preset) {
    case 'last_7_days':
      return 'Ultimos 7 dias';
    case 'last_30_days':
      return 'Ultimos 30 dias';
    case 'this_month':
      return 'Este mes';
    case 'custom':
      return `${formatDateOnlyPtBr(period.startDate)} ate ${formatDateOnlyPtBr(period.endDate)}`;
    default:
      return '';
  }
}

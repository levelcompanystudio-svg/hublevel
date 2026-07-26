import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterBar } from '../../../components/layout/FilterBar';
import { PageHeader } from '../../../components/layout/PageHeader';
import { StatsGrid } from '../../../components/layout/StatsGrid';
import { SummaryCard } from '../../../components/layout/SummaryCard';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import {
  MEETING_EXPECTED_WEEKS,
  MEETING_FREQUENCIES,
  MEETING_OPERATIONAL_STATUSES,
  MEETING_POST_STATUSES,
  meetingExpectedWeekLabels,
  meetingFrequencyLabels,
  meetingOperationalStatusLabels,
  meetingPostStatusLabels,
} from '../client-meeting-settings.types';
import type {
  MeetingExpectedWeek,
  MeetingFrequency,
  MeetingOperationalStatus,
  MeetingPostStatus,
} from '../client-meeting-settings.types';
import { upsertClientMeetingSettings } from '../client-meeting-settings.api';
import { MeetingConsoleTable } from '../components/MeetingConsoleTable';
import { getMeetingConsoleRows, listResponsibleOptions, markMeetingAsRealizada } from '../meeting-console.api';
import { hasNoScheduling, isOverdue, isUpcoming, meetingConsoleQuickFilterLabels } from '../meeting-console.types';
import type { MeetingConsoleQuickFilter, MeetingConsoleRow } from '../meeting-console.types';

const QUICK_FILTERS: MeetingConsoleQuickFilter[] = ['todos', 'sem_agendamento', 'proximas', 'atrasadas'];
const FILTER_ALL = 'todos';

export function MeetingConsolePage() {
  const { profile } = useAuth();
  const role = profile?.roles?.name;

  const [rows, setRows] = useState<MeetingConsoleRow[]>([]);
  const [responsibleOptions, setResponsibleOptions] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [quickFilter, setQuickFilter] = useState<MeetingConsoleQuickFilter>('todos');
  const [responsibleFilter, setResponsibleFilter] = useState<string>(FILTER_ALL);
  const [frequencyFilter, setFrequencyFilter] = useState<MeetingFrequency | 'todos'>(FILTER_ALL);
  const [weekFilter, setWeekFilter] = useState<MeetingExpectedWeek | 'todos'>(FILTER_ALL);
  const [statusFilter, setStatusFilter] = useState<MeetingOperationalStatus | 'todos'>(FILTER_ALL);
  const [postFilter, setPostFilter] = useState<MeetingPostStatus | 'todos'>(FILTER_ALL);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [rowsResult, responsibleResult] = await Promise.all([getMeetingConsoleRows(), listResponsibleOptions()]);
      setRows(rowsResult);
      setResponsibleOptions(responsibleResult);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar a operacao de reunioes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (role !== 'admin' && role !== 'gestor') {
      setLoading(false);
      return;
    }
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  async function applySettingPatch(
    clientId: string,
    patch: Parameters<typeof upsertClientMeetingSettings>[1],
  ) {
    if (!profile) return;
    try {
      setBusyKey(clientId);
      await upsertClientMeetingSettings(clientId, patch, profile.id);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar configuracao de reuniao.');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleMarkRealizada(meetingId: string) {
    try {
      setBusyKey(meetingId);
      await markMeetingAsRealizada(meetingId);
      await load();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao registrar reuniao como realizada.');
    } finally {
      setBusyKey(null);
    }
  }

  async function handleChangeFrequency(clientId: string, value: MeetingFrequency) {
    if (value !== 'personalizada') {
      await applySettingPatch(clientId, { frequency: value, custom_frequency_days: null });
      return;
    }

    const input = window.prompt('Informe a quantidade de dias para a frequencia personalizada.');
    if (input === null) return;

    const customDays = Number(input);
    if (!Number.isInteger(customDays) || customDays <= 0) {
      setError('Frequencia personalizada exige uma quantidade de dias valida.');
      return;
    }

    await applySettingPatch(clientId, { frequency: value, custom_frequency_days: customDays });
  }

  const nowMs = Date.now();

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const matchesQuick =
        quickFilter === 'todos' ||
        (quickFilter === 'sem_agendamento' && hasNoScheduling(row)) ||
        (quickFilter === 'proximas' && isUpcoming(row, nowMs)) ||
        (quickFilter === 'atrasadas' && isOverdue(row));

      if (!matchesQuick) return false;
      if (responsibleFilter !== FILTER_ALL && row.responsibleId !== responsibleFilter) return false;
      if (frequencyFilter !== FILTER_ALL && row.frequency !== frequencyFilter) return false;
      if (weekFilter !== FILTER_ALL && row.expectedWeek !== weekFilter) return false;
      if (statusFilter !== FILTER_ALL && row.operationalStatus !== statusFilter) return false;
      if (postFilter !== FILTER_ALL && row.postMeetingStatus !== postFilter) return false;
      return true;
    });
  }, [rows, quickFilter, responsibleFilter, frequencyFilter, weekFilter, statusFilter, postFilter, nowMs]);

  const overdueCount = useMemo(() => rows.filter((row) => isOverdue(row)).length, [rows]);
  const upcomingCount = useMemo(() => rows.filter((row) => isUpcoming(row, nowMs)).length, [rows, nowMs]);
  const noSchedulingCount = useMemo(() => rows.filter((row) => hasNoScheduling(row)).length, [rows]);

  if (role !== 'admin' && role !== 'gestor') {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operacao"
        title="Reunioes"
        description="Visao operacional de reunioes por cliente ativo: cadencia esperada, ultimo encontro, proximo agendamento e pendencias de pos-reuniao."
      />

      {loading && <LoadingState title="Carregando operacao de reunioes" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        <>
          <StatsGrid className="sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard label="Clientes ativos" value={rows.length} tone="brand" />
            <SummaryCard label="Reunioes atrasadas" value={overdueCount} tone={overdueCount > 0 ? 'warning' : 'neutral'} />
            <SummaryCard label="Reunioes proximas (7d)" value={upcomingCount} tone="neutral" />
            <SummaryCard label="Sem agendamento" value={noSchedulingCount} tone="neutral" />
          </StatsGrid>

          <FilterBar label="Visao rapida">
            <div className="flex flex-wrap gap-1.5">
              {QUICK_FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setQuickFilter(filter)}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                    quickFilter === filter
                      ? 'border-primary/60 bg-primary text-primary-foreground'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                  }`}
                >
                  {meetingConsoleQuickFilterLabels[filter]}
                </button>
              ))}
            </div>
          </FilterBar>

          <FilterBar label="Filtros">
            <div className="flex flex-wrap gap-2">
              <select
                value={responsibleFilter}
                onChange={(event) => setResponsibleFilter(event.target.value)}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground"
              >
                <option value={FILTER_ALL}>Todos os gestores</option>
                {responsibleOptions.map((option) => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>

              <select
                value={frequencyFilter}
                onChange={(event) => setFrequencyFilter(event.target.value as MeetingFrequency | 'todos')}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground"
              >
                <option value={FILTER_ALL}>Todas as frequencias</option>
                {MEETING_FREQUENCIES.map((option) => (
                  <option key={option} value={option}>{meetingFrequencyLabels[option]}</option>
                ))}
              </select>

              <select
                value={weekFilter}
                onChange={(event) => setWeekFilter(event.target.value as MeetingExpectedWeek | 'todos')}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground"
              >
                <option value={FILTER_ALL}>Todas as semanas</option>
                {MEETING_EXPECTED_WEEKS.map((option) => (
                  <option key={option} value={option}>{meetingExpectedWeekLabels[option]}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as MeetingOperationalStatus | 'todos')}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground"
              >
                <option value={FILTER_ALL}>Todos os status</option>
                {MEETING_OPERATIONAL_STATUSES.map((option) => (
                  <option key={option} value={option}>{meetingOperationalStatusLabels[option]}</option>
                ))}
              </select>

              <select
                value={postFilter}
                onChange={(event) => setPostFilter(event.target.value as MeetingPostStatus | 'todos')}
                className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground"
              >
                <option value={FILTER_ALL}>Todo pos-reuniao</option>
                {MEETING_POST_STATUSES.map((option) => (
                  <option key={option} value={option}>{meetingPostStatusLabels[option]}</option>
                ))}
              </select>
            </div>
          </FilterBar>

          <MeetingConsoleTable
            rows={filteredRows}
            busyKey={busyKey}
            onChangeFrequency={(clientId, value) => void handleChangeFrequency(clientId, value)}
            onChangeExpectedWeek={(clientId, value) => void applySettingPatch(clientId, { expected_week: value })}
            onChangeOperationalStatus={(clientId, value) => void applySettingPatch(clientId, { operational_status: value })}
            onChangePostMeetingStatus={(clientId, value) => void applySettingPatch(clientId, { post_meeting_status: value })}
            onMarkRealizada={(meetingId) => void handleMarkRealizada(meetingId)}
          />
        </>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { FilterPanel } from '../../../components/layout/FilterPanel';
import { KpiStrip } from '../../../components/layout/KpiStrip';
import { PageHeader } from '../../../components/layout/PageHeader';
import { QuickFilterPill } from '../../../components/layout/QuickFilterPill';
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

interface FilterSelectProps<T extends string> {
  label: string;
  value: T;
  onChange: (value: T) => void;
  options: Array<{ value: T; label: string }>;
}

function FilterSelect<T extends string>({ label, value, onChange, options }: FilterSelectProps<T>) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className="rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-foreground"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>{option.label}</option>
        ))}
      </select>
    </label>
  );
}

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

  function handleClearFilters() {
    setQuickFilter('todos');
    setResponsibleFilter(FILTER_ALL);
    setFrequencyFilter(FILTER_ALL);
    setWeekFilter(FILTER_ALL);
    setStatusFilter(FILTER_ALL);
    setPostFilter(FILTER_ALL);
  }

  const filtersActive =
    quickFilter !== 'todos' ||
    responsibleFilter !== FILTER_ALL ||
    frequencyFilter !== FILTER_ALL ||
    weekFilter !== FILTER_ALL ||
    statusFilter !== FILTER_ALL ||
    postFilter !== FILTER_ALL;

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
  const postPendingCount = useMemo(() => rows.filter((row) => row.postMeetingStatus === 'pendente').length, [rows]);

  if (role !== 'admin' && role !== 'gestor') {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Operacao"
        title="Reunioes"
        description="Cadencia de reunioes por cliente ativo: quem esta em dia, quem precisa ser agendado e o que ficou pendente depois do encontro."
      />

      {loading && <LoadingState title="Carregando operacao de reunioes" />}
      {error && <ErrorState description={error} />}

      {!loading && !error && (
        <>
          <KpiStrip
            items={[
              { label: 'Clientes na rotina', value: rows.length, tone: 'brand' },
              { label: 'Sem agendamento', value: noSchedulingCount, tone: noSchedulingCount > 0 ? 'warning' : 'neutral' },
              { label: 'Reunioes proximas (7d)', value: upcomingCount, tone: 'neutral' },
              { label: 'Reunioes atrasadas', value: overdueCount, tone: overdueCount > 0 ? 'warning' : 'neutral' },
              { label: 'Pos-reuniao pendente', value: postPendingCount, tone: postPendingCount > 0 ? 'warning' : 'neutral' },
            ]}
          />

          <FilterPanel
            filtersActive={filtersActive}
            onClearFilters={handleClearFilters}
            quickFilters={QUICK_FILTERS.map((filter) => (
              <QuickFilterPill
                key={filter}
                label={meetingConsoleQuickFilterLabels[filter]}
                active={quickFilter === filter}
                onClick={() => setQuickFilter(filter)}
              />
            ))}
          >
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              <FilterSelect
                label="Gestor"
                value={responsibleFilter}
                onChange={setResponsibleFilter}
                options={[
                  { value: FILTER_ALL, label: 'Todos' },
                  ...responsibleOptions.map((option) => ({ value: option.id, label: option.name })),
                ]}
              />
              <FilterSelect
                label="Frequencia"
                value={frequencyFilter}
                onChange={setFrequencyFilter}
                options={[
                  { value: FILTER_ALL, label: 'Todas' },
                  ...MEETING_FREQUENCIES.map((option) => ({ value: option, label: meetingFrequencyLabels[option] })),
                ]}
              />
              <FilterSelect
                label="Semana prevista"
                value={weekFilter}
                onChange={setWeekFilter}
                options={[
                  { value: FILTER_ALL, label: 'Todas' },
                  ...MEETING_EXPECTED_WEEKS.map((option) => ({ value: option, label: meetingExpectedWeekLabels[option] })),
                ]}
              />
              <FilterSelect
                label="Status da reuniao"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: FILTER_ALL, label: 'Todos' },
                  ...MEETING_OPERATIONAL_STATUSES.map((option) => ({ value: option, label: meetingOperationalStatusLabels[option] })),
                ]}
              />
              <FilterSelect
                label="Pos-reuniao"
                value={postFilter}
                onChange={setPostFilter}
                options={[
                  { value: FILTER_ALL, label: 'Todos' },
                  ...MEETING_POST_STATUSES.map((option) => ({ value: option, label: meetingPostStatusLabels[option] })),
                ]}
              />
            </div>
          </FilterPanel>

          <MeetingConsoleTable
            rows={filteredRows}
            hasAnyRows={rows.length > 0}
            filtersActive={filtersActive}
            busyKey={busyKey}
            onSaveFrequency={(clientId, patch) => void applySettingPatch(clientId, patch)}
            onChangeExpectedWeek={(clientId, value) => void applySettingPatch(clientId, { expected_week: value })}
            onChangeOperationalStatus={(clientId, value) => void applySettingPatch(clientId, { operational_status: value })}
            onChangePostMeetingStatus={(clientId, value) => void applySettingPatch(clientId, { post_meeting_status: value })}
            onMarkRealizada={(meetingId) => void handleMarkRealizada(meetingId)}
            onClearFilters={handleClearFilters}
          />
        </>
      )}
    </div>
  );
}

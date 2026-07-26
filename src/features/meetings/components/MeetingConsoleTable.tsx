import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Badge, Button, Card } from '../../../components/ui';
import {
  MEETING_EXPECTED_WEEKS,
  MEETING_OPERATIONAL_STATUSES,
  MEETING_POST_STATUSES,
  meetingExpectedWeekLabels,
  meetingOperationalStatusLabels,
  meetingPostStatusLabels,
} from '../client-meeting-settings.types';
import type {
  MeetingExpectedWeek,
  MeetingFrequency,
  MeetingOperationalStatus,
  MeetingPostStatus,
} from '../client-meeting-settings.types';
import { formatDateTime } from './MeetingTable';
import { MeetingFrequencyCell } from './MeetingFrequencyCell';
import { MeetingSettingSelect } from './MeetingSettingSelect';
import { pendingMeeting } from '../meeting-console.types';
import type { MeetingConsoleRow } from '../meeting-console.types';

interface MeetingConsoleTableProps {
  rows: MeetingConsoleRow[];
  hasAnyRows: boolean;
  filtersActive: boolean;
  busyKey: string | null;
  onSaveFrequency: (clientId: string, patch: { frequency: MeetingFrequency; custom_frequency_days: number | null }) => void;
  onChangeExpectedWeek: (clientId: string, value: MeetingExpectedWeek) => void;
  onChangeOperationalStatus: (clientId: string, value: MeetingOperationalStatus) => void;
  onChangePostMeetingStatus: (clientId: string, value: MeetingPostStatus) => void;
  onMarkRealizada: (meetingId: string) => void;
  onClearFilters: () => void;
}

export function MeetingConsoleTable({
  rows,
  hasAnyRows,
  filtersActive,
  busyKey,
  onSaveFrequency,
  onChangeExpectedWeek,
  onChangeOperationalStatus,
  onChangePostMeetingStatus,
  onMarkRealizada,
  onClearFilters,
}: MeetingConsoleTableProps) {
  if (rows.length === 0) {
    return (
      <Card>
        {!hasAnyRows ? (
          <EmptyState
            title="Nenhum cliente ativo ainda"
            description="Assim que um cliente estiver com status ativo ou onboarding, ele aparece automaticamente aqui - nao e preciso cadastrar nada manualmente."
          />
        ) : (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <EmptyState
              title="Nenhum cliente encontrado"
              description="Nenhum cliente corresponde aos filtros selecionados."
            />
            {filtersActive && (
              <Button type="button" variant="secondary" size="sm" onClick={onClearFilters}>
                Limpar filtros
              </Button>
            )}
          </div>
        )}
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1220px] border-collapse text-left">
          <thead className="border-b border-border bg-surface text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3.5 font-semibold">Cliente</th>
              <th className="px-4 py-3.5 font-semibold">Responsavel</th>
              <th className="px-4 py-3.5 font-semibold">Frequencia</th>
              <th className="px-4 py-3.5 font-semibold">Semana prevista</th>
              <th className="px-4 py-3.5 font-semibold">Ultimo encontro</th>
              <th className="px-4 py-3.5 font-semibold">Proximo agendamento</th>
              <th className="px-4 py-3.5 font-semibold">Status da reuniao</th>
              <th className="px-4 py-3.5 font-semibold">Pos-reuniao</th>
              <th className="px-4 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => {
              const saving = busyKey === row.clientId;
              const pending = pendingMeeting(row);
              const markingRealizada = pending !== null && busyKey === pending.id;

              return (
                <tr key={row.clientId} className="bg-card transition-colors hover:bg-card-elevated">
                  <td className="px-4 py-3">
                    <p className="text-sm font-semibold text-foreground">{row.tradeName || row.companyName}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{row.responsibleName}</td>
                  <td className="px-4 py-3">
                    <MeetingFrequencyCell
                      frequency={row.frequency}
                      customFrequencyDays={row.customFrequencyDays}
                      disabled={saving}
                      onSave={(patch) => onSaveFrequency(row.clientId, patch)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <MeetingSettingSelect
                      value={row.expectedWeek}
                      options={MEETING_EXPECTED_WEEKS}
                      labels={meetingExpectedWeekLabels}
                      disabled={saving}
                      onChange={(value) => onChangeExpectedWeek(row.clientId, value)}
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {row.lastMeetingAt ? formatDateTime(row.lastMeetingAt) : 'Sem registro'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {row.overdueMeetingAt ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-muted-foreground">{formatDateTime(row.overdueMeetingAt)}</span>
                        <Badge tone="destructive">Atrasada</Badge>
                      </div>
                    ) : row.nextMeetingAt ? (
                      <span className="text-muted-foreground">{formatDateTime(row.nextMeetingAt)}</span>
                    ) : (
                      <span className="text-muted-foreground">Sem agendamento</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <MeetingSettingSelect
                      value={row.operationalStatus}
                      options={MEETING_OPERATIONAL_STATUSES}
                      labels={meetingOperationalStatusLabels}
                      disabled={saving}
                      onChange={(value) => onChangeOperationalStatus(row.clientId, value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <MeetingSettingSelect
                      value={row.postMeetingStatus}
                      options={MEETING_POST_STATUSES}
                      labels={meetingPostStatusLabels}
                      disabled={saving}
                      onChange={(value) => onChangePostMeetingStatus(row.clientId, value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      <Link to={`/app/reunioes/novo?client_id=${row.clientId}`}>
                        <Button type="button" variant="ghost" size="sm">Agendar</Button>
                      </Link>
                      {pending ? (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          disabled={markingRealizada}
                          onClick={() => onMarkRealizada(pending.id)}
                        >
                          {markingRealizada ? 'Salvando...' : 'Marcar realizada'}
                        </Button>
                      ) : (
                        <Link to={`/app/reunioes/novo?client_id=${row.clientId}&status=realizada`}>
                          <Button type="button" variant="secondary" size="sm">Registrar realizada</Button>
                        </Link>
                      )}
                      {row.postMeetingStatus === 'pendente' && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          disabled={saving}
                          onClick={() => onChangePostMeetingStatus(row.clientId, 'feito')}
                        >
                          Pos-reuniao feito
                        </Button>
                      )}
                      <Link to={`/app/clientes/${row.clientId}`}>
                        <Button type="button" variant="ghost" size="sm">Abrir cliente</Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

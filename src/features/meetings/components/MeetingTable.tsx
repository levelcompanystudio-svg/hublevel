import { Link } from 'react-router-dom';
import { EmptyState } from '../../../components/feedback/EmptyState';
import { Button, Card } from '../../../components/ui';
import type { Meeting } from '../meetings.types';
import { MeetingStatusBadge } from './MeetingStatusBadge';
import { MeetingTypeBadge } from './MeetingTypeBadge';

interface MeetingTableProps {
  meetings: Meeting[];
}

export function MeetingTable({ meetings }: MeetingTableProps) {
  if (meetings.length === 0) {
    return (
      <Card>
        <EmptyState
          title="Nenhuma reuniao registrada"
          description="As reunioes agendadas ou realizadas com os clientes aparecerao aqui."
        />
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[880px] border-collapse text-left">
          <thead className="border-b border-border bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-5 py-3.5 font-semibold">Reuniao</th>
              <th className="px-5 py-3.5 font-semibold">Cliente</th>
              <th className="px-5 py-3.5 font-semibold">Tipo</th>
              <th className="px-5 py-3.5 font-semibold">Data/hora</th>
              <th className="px-5 py-3.5 font-semibold">Status</th>
              <th className="px-5 py-3.5 text-right font-semibold">Acoes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="bg-card transition-colors hover:bg-muted/30">
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-foreground">{meeting.title}</p>
                </td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{clientName(meeting)}</td>
                <td className="px-5 py-4"><MeetingTypeBadge type={meeting.type} /></td>
                <td className="px-5 py-4 text-sm text-muted-foreground">{formatDateTime(meeting.scheduled_at)}</td>
                <td className="px-5 py-4"><MeetingStatusBadge status={meeting.status} /></td>
                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <Link to={`/app/reunioes/${meeting.id}`}>
                      <Button type="button" variant="ghost">Ver</Button>
                    </Link>
                    <Link to={`/app/reunioes/${meeting.id}/editar`}>
                      <Button type="button">Editar</Button>
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

export function clientName(meeting: Meeting): string {
  const client = Array.isArray(meeting.client) ? meeting.client[0] : meeting.client;
  return client?.trade_name || client?.company_name || 'Reuniao interna';
}

export function creatorName(meeting: Meeting): string {
  const creator = Array.isArray(meeting.creator) ? meeting.creator[0] : meeting.creator;
  return creator?.name ?? '-';
}

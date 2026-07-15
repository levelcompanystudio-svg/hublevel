import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Button, Card } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getMeeting } from '../meetings.api';
import type { Meeting } from '../meetings.types';
import { MeetingHeader } from '../components/MeetingHeader';
import { MeetingStatusBadge } from '../components/MeetingStatusBadge';
import { MeetingTypeBadge } from '../components/MeetingTypeBadge';
import { clientName, creatorName, formatDateTime } from '../components/MeetingTable';

export function MeetingDetailsPage() {
  const { id } = useParams();
  const { profile } = useAuth();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const role = profile?.roles?.name;
  const canAccess = role === 'admin' || role === 'gestor';

  useEffect(() => {
    if (!id || !canAccess) {
      setLoading(false);
      return;
    }

    let active = true;
    const meetingId = id;

    async function loadMeeting() {
      try {
        setLoading(true);
        setError(null);
        const result = await getMeeting(meetingId);
        if (active) setMeeting(result);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao carregar reuniao.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadMeeting();

    return () => {
      active = false;
    };
  }, [canAccess, id]);

  if (!canAccess) {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <MeetingHeader title={meeting?.title ?? 'Reuniao'} description="Detalhe da reuniao registrada." />

      {loading && <LoadingState title="Carregando reuniao" />}
      {error && <ErrorState description={error} />}

      {!loading && meeting && (
        <Card>
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              {meeting.client_id ? (
                <Link to={`/app/clientes/${meeting.client_id}`} className="text-sm text-primary hover:underline">
                  {clientName(meeting)}
                </Link>
              ) : (
                <p className="text-sm text-muted-foreground">{clientName(meeting)}</p>
              )}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <MeetingStatusBadge status={meeting.status} />
                <MeetingTypeBadge type={meeting.type} />
              </div>
            </div>
            <Link to={`/app/reunioes/${meeting.id}/editar`}>
              <Button type="button">Editar reuniao</Button>
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <InfoItem label="Data e hora" value={formatDateTime(meeting.scheduled_at)} />
            <InfoItem label="Criado por" value={creatorName(meeting)} />
            <InfoItem
              label="Participantes"
              value={meeting.participants && meeting.participants.length > 0
                ? meeting.participants.map((participant) => participant.name).join(', ')
                : 'Nenhum participante registrado'}
            />
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <TextBlock label="Pauta" value={meeting.agenda} />
            <TextBlock label="Notas" value={meeting.notes} />
            <TextBlock label="Decisoes" value={meeting.decisions} />
            <TextBlock label="Proximos passos" value={meeting.next_steps} />
          </div>
        </Card>
      )}
    </div>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-xs font-medium uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function TextBlock({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-lg border border-border bg-muted/40 p-4">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
        {value || 'Nao informado.'}
      </p>
    </div>
  );
}

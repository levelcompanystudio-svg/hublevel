import { useEffect, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createMeeting, getMeeting, listMeetingClients, listMeetingParticipantDirectory, updateMeeting } from '../meetings.api';
import type { MeetingClientRef, MeetingFormValues, MeetingParticipant } from '../meetings.types';
import { emptyMeetingFormValues, toDatetimeLocalInput, validateMeetingForm } from '../meetings.types';
import { MeetingForm } from '../components/MeetingForm';
import { MeetingHeader } from '../components/MeetingHeader';

export function MeetingFormPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const preselectedClientId = searchParams.get('client_id') ?? '';
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [values, setValues] = useState<MeetingFormValues>(emptyMeetingFormValues);
  const [clients, setClients] = useState<MeetingClientRef[]>([]);
  const [participantDirectory, setParticipantDirectory] = useState<MeetingParticipant[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const role = profile?.roles?.name;
  const editing = Boolean(id);
  const canAccess = role === 'admin' || role === 'gestor';

  useEffect(() => {
    if (!profile || !canAccess) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadFormData() {
      try {
        setLoading(true);
        setError(null);

        const [clientRows, directory, meeting] = await Promise.all([
          listMeetingClients(),
          listMeetingParticipantDirectory(),
          id ? getMeeting(id) : Promise.resolve(null),
        ]);

        if (!active) return;

        setClients(clientRows);
        setParticipantDirectory(directory);

        if (meeting) {
          setValues({
            client_id: meeting.client_id ?? '',
            title: meeting.title,
            type: meeting.type,
            scheduled_at: toDatetimeLocalInput(meeting.scheduled_at),
            status: meeting.status,
            participant_ids: (meeting.participants ?? []).map((participant) => participant.user_id),
            agenda: meeting.agenda ?? '',
            notes: meeting.notes ?? '',
            decisions: meeting.decisions ?? '',
            next_steps: meeting.next_steps ?? '',
          });
        } else {
          setValues({
            ...emptyMeetingFormValues,
            client_id: preselectedClientId,
          });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Erro ao preparar formulario de reuniao.';
        if (active) setError(message);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadFormData();

    return () => {
      active = false;
    };
  }, [canAccess, id, preselectedClientId, profile]);

  async function handleSubmit() {
    if (!profile) return;

    const validationError = validateMeetingForm(values);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      const saved = id
        ? await updateMeeting(id, values, participantDirectory)
        : await createMeeting(values, participantDirectory, profile.id);

      navigate(`/app/reunioes/${saved.id}`, { replace: true });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro ao salvar reuniao.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (!canAccess) {
    return <AccessDeniedPlaceholder />;
  }

  return (
    <div className="space-y-6">
      <MeetingHeader
        title={editing ? 'Editar reuniao' : 'Nova reuniao'}
        description={editing ? 'Atualize os dados da reuniao.' : 'Registre uma nova reuniao, alinhamento ou consultoria.'}
      />

      {loading && <LoadingState title="Preparando formulario" />}
      {error && <ErrorState description={error} />}
      {!loading && (
        <MeetingForm
          values={values}
          clients={clients}
          participantDirectory={participantDirectory}
          loading={saving}
          submitLabel={editing ? 'Salvar alteracoes' : 'Registrar reuniao'}
          onChange={setValues}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

import type { FormEvent } from 'react';
import { Button, Card } from '../../../components/ui';
import type { MeetingClientRef, MeetingFormValues, MeetingParticipant } from '../meetings.types';

interface MeetingFormProps {
  values: MeetingFormValues;
  clients: MeetingClientRef[];
  participantDirectory: MeetingParticipant[];
  loading?: boolean;
  submitLabel: string;
  onChange: (values: MeetingFormValues) => void;
  onSubmit: () => void;
}

export function MeetingForm({
  values,
  clients,
  participantDirectory,
  loading = false,
  submitLabel,
  onChange,
  onSubmit,
}: MeetingFormProps) {
  function setField<K extends keyof MeetingFormValues>(key: K, value: MeetingFormValues[K]) {
    onChange({ ...values, [key]: value });
  }

  function toggleParticipant(userId: string, checked: boolean) {
    const nextIds = checked
      ? [...values.participant_ids, userId]
      : values.participant_ids.filter((id) => id !== userId);
    setField('participant_ids', nextIds);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Cliente">
            <select
              value={values.client_id}
              onChange={(event) => setField('client_id', event.target.value)}
              className={inputClassName}
            >
              <option value="">Reuniao interna (sem cliente)</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.trade_name || client.company_name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tipo" required>
            <select
              required
              value={values.type}
              onChange={(event) => setField('type', event.target.value as MeetingFormValues['type'])}
              className={inputClassName}
            >
              <option value="onboarding">Onboarding</option>
              <option value="alinhamento">Alinhamento</option>
              <option value="performance">Performance</option>
              <option value="comercial">Comercial</option>
              <option value="interna">Interna</option>
              <option value="outro">Outro</option>
            </select>
          </Field>

          <div className="lg:col-span-2">
            <Field label="Titulo" required>
              <input
                required
                value={values.title}
                onChange={(event) => setField('title', event.target.value)}
                className={inputClassName}
                placeholder="Ex.: Alinhamento mensal - Cliente X"
              />
            </Field>
          </div>

          <Field label="Data e hora" required>
            <input
              required
              type="datetime-local"
              value={values.scheduled_at}
              onChange={(event) => setField('scheduled_at', event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Status" required>
            <select
              required
              value={values.status}
              onChange={(event) => setField('status', event.target.value as MeetingFormValues['status'])}
              className={inputClassName}
            >
              <option value="agendada">Agendada</option>
              <option value="realizada">Realizada</option>
              <option value="cancelada">Cancelada</option>
              <option value="remarcada">Remarcada</option>
            </select>
          </Field>

          <div className="lg:col-span-2">
            <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">Participantes</span>
            {participantDirectory.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum usuario ativo disponivel para selecionar.</p>
            ) : (
              <div className="grid max-h-40 gap-2 overflow-y-auto rounded-md border border-border bg-background p-3 sm:grid-cols-2">
                {participantDirectory.map((participant) => (
                  <label key={participant.user_id} className="flex items-center gap-2 text-sm text-foreground">
                    <input
                      type="checkbox"
                      checked={values.participant_ids.includes(participant.user_id)}
                      onChange={(event) => toggleParticipant(participant.user_id, event.target.checked)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    {participant.name}
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <Field label="Pauta">
              <textarea
                value={values.agenda}
                onChange={(event) => setField('agenda', event.target.value)}
                className={`${inputClassName} min-h-20 resize-y`}
                placeholder="Assuntos previstos para a reuniao"
              />
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field label="Notas">
              <textarea
                value={values.notes}
                onChange={(event) => setField('notes', event.target.value)}
                className={`${inputClassName} min-h-20 resize-y`}
                placeholder="Observacoes gerais sobre a reuniao"
              />
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field label="Decisoes">
              <textarea
                value={values.decisions}
                onChange={(event) => setField('decisions', event.target.value)}
                className={`${inputClassName} min-h-20 resize-y`}
                placeholder="Decisoes tomadas durante a reuniao"
              />
            </Field>
          </div>

          <div className="lg:col-span-2">
            <Field label="Proximos passos">
              <textarea
                value={values.next_steps}
                onChange={(event) => setField('next_steps', event.target.value)}
                className={`${inputClassName} min-h-20 resize-y`}
                placeholder="Acoes combinadas para depois da reuniao"
              />
            </Field>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? 'Salvando...' : submitLabel}
          </Button>
        </div>
      </Card>
    </form>
  );
}

const inputClassName = 'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground';

function Field({
  label,
  required = false,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase text-muted-foreground">
        {label}
        {required ? ' *' : ''}
      </span>
      {children}
    </label>
  );
}

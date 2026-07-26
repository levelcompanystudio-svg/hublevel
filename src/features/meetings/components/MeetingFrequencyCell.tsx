import { useEffect, useState } from 'react';
import { Button } from '../../../components/ui';
import { MEETING_FREQUENCIES, meetingFrequencyLabels } from '../client-meeting-settings.types';
import type { MeetingFrequency } from '../client-meeting-settings.types';
import { MeetingSettingSelect } from './MeetingSettingSelect';

interface MeetingFrequencyCellProps {
  frequency: MeetingFrequency;
  customFrequencyDays: number | null;
  disabled: boolean;
  onSave: (patch: { frequency: MeetingFrequency; custom_frequency_days: number | null }) => void;
}

// Frequencia personalizada exige a quantidade de dias (constraint do banco). Em vez de um
// window.prompt, o input de dias aparece inline nesta celula e so dispara onSave quando um
// valor valido e confirmado - assim nunca mandamos "personalizada" sem dias para a API.
export function MeetingFrequencyCell({ frequency, customFrequencyDays, disabled, onSave }: MeetingFrequencyCellProps) {
  const [editingCustom, setEditingCustom] = useState(false);
  const [draftDays, setDraftDays] = useState(customFrequencyDays != null ? String(customFrequencyDays) : '');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    setDraftDays(customFrequencyDays != null ? String(customFrequencyDays) : '');
    setEditingCustom(false);
    setLocalError(null);
  }, [frequency, customFrequencyDays]);

  function handleFrequencyChange(value: MeetingFrequency) {
    setLocalError(null);
    if (value === 'personalizada') {
      setEditingCustom(true);
      return;
    }
    onSave({ frequency: value, custom_frequency_days: null });
  }

  function handleConfirmCustomDays() {
    const days = Number(draftDays);
    if (!Number.isInteger(days) || days <= 0) {
      setLocalError('Informe um numero inteiro de dias maior que zero.');
      return;
    }
    setLocalError(null);
    setEditingCustom(false);
    onSave({ frequency: 'personalizada', custom_frequency_days: days });
  }

  const labels =
    frequency === 'personalizada' && customFrequencyDays != null
      ? { ...meetingFrequencyLabels, personalizada: `Personalizada: ${customFrequencyDays} dias` }
      : meetingFrequencyLabels;

  const showCustomInput = editingCustom || (frequency === 'personalizada' && customFrequencyDays == null);

  return (
    <div className="flex flex-col gap-1">
      <MeetingSettingSelect
        value={editingCustom ? 'personalizada' : frequency}
        options={MEETING_FREQUENCIES}
        labels={labels}
        disabled={disabled}
        onChange={handleFrequencyChange}
      />

      {showCustomInput ? (
        <div className="flex items-center gap-1">
          <input
            type="number"
            min={1}
            step={1}
            value={draftDays}
            onChange={(event) => setDraftDays(event.target.value)}
            placeholder="dias"
            className="w-16 rounded-md border border-border bg-surface px-2 py-1 text-xs text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
          />
          <Button type="button" variant="secondary" size="sm" disabled={disabled} onClick={handleConfirmCustomDays}>
            Salvar
          </Button>
        </div>
      ) : (
        frequency === 'personalizada' && (
          <button
            type="button"
            onClick={() => setEditingCustom(true)}
            className="w-fit text-left text-[11px] font-medium text-primary hover:underline"
          >
            Editar dias
          </button>
        )
      )}

      {localError && <p className="text-[11px] text-destructive">{localError}</p>}
    </div>
  );
}

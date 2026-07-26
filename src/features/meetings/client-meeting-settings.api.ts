import { supabase } from '../../lib/supabase';
import { defaultClientMeetingSettings } from './client-meeting-settings.types';
import type { ClientMeetingSettings, ClientMeetingSettingsPatch } from './client-meeting-settings.types';

export async function listClientMeetingSettings(): Promise<ClientMeetingSettings[]> {
  const { data, error } = await supabase
    .from('client_meeting_settings')
    .select('*')
    .is('deleted_at', null);

  if (error) throw error;
  return (data ?? []) as ClientMeetingSettings[];
}

function assertCustomFrequencyDays(frequency: string, customFrequencyDays: number | null | undefined): void {
  if (frequency === 'personalizada' && (customFrequencyDays === null || customFrequencyDays === undefined)) {
    throw new Error('Frequencia personalizada exige a quantidade de dias.');
  }
}

// Cria a linha de configuracao na primeira alteracao (o cliente ja aparece na tela antes disso,
// usando os defaults abaixo so no frontend) - por isso a tela nunca exige criar a linha manualmente.
export async function upsertClientMeetingSettings(
  clientId: string,
  patch: ClientMeetingSettingsPatch,
  userId: string,
): Promise<ClientMeetingSettings> {
  const { data: existing, error: lookupError } = await supabase
    .from('client_meeting_settings')
    .select('id, frequency, custom_frequency_days')
    .eq('client_id', clientId)
    .is('deleted_at', null)
    .maybeSingle();

  if (lookupError) throw lookupError;

  if (existing) {
    const resultingFrequency = patch.frequency ?? existing.frequency;
    const resultingCustomDays = patch.custom_frequency_days !== undefined ? patch.custom_frequency_days : existing.custom_frequency_days;
    assertCustomFrequencyDays(resultingFrequency, resultingCustomDays);

    const { data, error } = await supabase
      .from('client_meeting_settings')
      .update({ ...patch, updated_by: userId })
      .eq('client_id', clientId)
      .select('*')
      .single();

    if (error) throw error;
    return data as ClientMeetingSettings;
  }

  const resultingFrequency = patch.frequency ?? defaultClientMeetingSettings.frequency ?? 'mensal';
  const resultingCustomDays = patch.custom_frequency_days ?? null;
  assertCustomFrequencyDays(resultingFrequency, resultingCustomDays);

  const { data, error } = await supabase
    .from('client_meeting_settings')
    .insert({
      client_id: clientId,
      ...defaultClientMeetingSettings,
      ...patch,
      created_by: userId,
    })
    .select('*')
    .single();

  if (error) throw error;
  return data as ClientMeetingSettings;
}

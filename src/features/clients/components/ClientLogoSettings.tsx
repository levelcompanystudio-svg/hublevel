import type { ChangeEvent } from 'react';
import { useState } from 'react';
import { useAuth } from '../../auth/useAuth';
import { uploadClientLogo, validateClientLogoFile } from '../clients.api';
import type { Client } from '../clients.types';

interface ClientLogoSettingsProps {
  clientId: string;
  hasLogo: boolean;
  onUpdated: (client: Client) => void;
}

export function ClientLogoSettings({ clientId, hasLogo, onUpdated }: ClientLogoSettingsProps) {
  const { profile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAdmin = profile?.roles?.name === 'admin';

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !profile) return;

    const validationError = validateClientLogoFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const updated = await uploadClientLogo(clientId, file, profile.id);
      onUpdated(updated);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar logo.');
    } finally {
      setUploading(false);
    }
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <>
      <label
        className="absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-xl bg-black/55 text-[10px] font-bold uppercase tracking-wide text-white opacity-0 backdrop-blur-[1px] transition hover:opacity-100 focus-within:opacity-100"
        title={hasLogo ? 'Trocar logo do cliente' : 'Enviar logo do cliente'}
        aria-label={hasLogo ? 'Trocar logo do cliente' : 'Enviar logo do cliente'}
      >
        <span>{uploading ? 'Enviando' : hasLogo ? 'Trocar' : 'Enviar'}</span>
        <input
          type="file"
          accept="image/png,image/jpeg,image/svg+xml,image/webp"
          className="sr-only"
          disabled={uploading}
          onClick={(event) => event.stopPropagation()}
          onChange={(event) => void handleFileChange(event)}
        />
      </label>
      {error && (
        <span
          className="absolute -bottom-1 -right-1 z-20 h-3 w-3 rounded-full border border-card bg-destructive"
          title={error}
          aria-label={error}
        />
      )}
    </>
  );
}

import { Settings } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { useRef, useState } from 'react';
import { Button } from '../../../components/ui';
import { useAuth } from '../../auth/useAuth';
import { removeClientLogo, uploadClientLogo, validateClientLogoFile } from '../clients.api';
import type { Client } from '../clients.types';

interface ClientLogoSettingsProps {
  clientId: string;
  hasLogo: boolean;
  onUpdated: (client: Client) => void;
}

export function ClientLogoSettings({ clientId, hasLogo, onUpdated }: ClientLogoSettingsProps) {
  const { profile } = useAuth();
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function stop(event: { preventDefault: () => void; stopPropagation: () => void }) {
    event.preventDefault();
    event.stopPropagation();
  }

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
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar logo.');
    } finally {
      setUploading(false);
    }
  }

  async function handleRemove() {
    if (!profile) return;
    try {
      setUploading(true);
      setError(null);
      const updated = await removeClientLogo(clientId, profile.id);
      onUpdated(updated);
      setOpen(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao remover logo.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={(event) => {
          stop(event);
          setOpen((value) => !value);
        }}
        className="flex h-5 w-5 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm transition hover:border-primary/50 hover:text-foreground"
        title="Configurar logo do cliente"
        aria-label="Configurar logo do cliente"
      >
        <Settings className="h-3 w-3" aria-hidden="true" />
      </button>

      {open && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 cursor-default"
            aria-label="Fechar"
            onClick={(event) => {
              stop(event);
              setOpen(false);
            }}
          />
          <div
            className="absolute left-0 top-7 z-50 w-56 rounded-lg border border-border bg-card p-3 shadow-xl"
            onClick={stop}
          >
            <p className="text-xs font-semibold text-foreground">Logo do cliente</p>
            <p className="mt-1 text-[11px] leading-4 text-muted-foreground">PNG, JPG, SVG ou WEBP, ate 2MB.</p>
            {error && <p className="mt-2 text-[11px] text-destructive">{error}</p>}
            <div className="mt-3 flex flex-col gap-1.5">
              <Button type="button" variant="secondary" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
                {uploading ? 'Enviando...' : 'Enviar logo'}
              </Button>
              {hasLogo && (
                <Button type="button" variant="ghost" disabled={uploading} onClick={() => void handleRemove()}>
                  Remover logo
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
              onChange={(event) => void handleFileChange(event)}
            />
          </div>
        </>
      )}
    </div>
  );
}

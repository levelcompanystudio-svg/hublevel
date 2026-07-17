import { useState } from 'react';
import type { FormEvent } from 'react';
import { submitLandingPageLead } from '../landing-page-public-leads.api';
import type { LandingPageContent } from '../landing-page-content';

type SubmitState = 'idle' | 'enviando' | 'sucesso' | 'erro';

interface PublicLandingLeadFormProps {
  landingPageId: string;
  content: LandingPageContent;
  utms: {
    utmSource: string | null;
    utmMedium: string | null;
    utmCampaign: string | null;
    utmContent: string | null;
    utmTerm: string | null;
  };
}

const inputClassName =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary disabled:cursor-not-allowed disabled:opacity-60';

export function PublicLandingLeadForm({ landingPageId, content, utms }: PublicLandingLeadFormProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // honeypot
  const [state, setState] = useState<SubmitState>('idle');
  const [error, setError] = useState<string | null>(null);

  const accentSolid = content.primaryColor ?? 'var(--color-primary)';
  const sending = state === 'enviando';

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    if (!email.trim() && !phone.trim()) {
      setError('Informe um e-mail ou telefone para contato.');
      setState('erro');
      return;
    }

    try {
      setState('enviando');
      setError(null);
      await submitLandingPageLead({
        landingPageId,
        name,
        email,
        phone,
        message,
        website,
        utmSource: utms.utmSource,
        utmMedium: utms.utmMedium,
        utmCampaign: utms.utmCampaign,
        utmContent: utms.utmContent,
        utmTerm: utms.utmTerm,
      });
      setState('sucesso');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar. Tente novamente.');
      setState('erro');
    }
  }

  if (state === 'sucesso') {
    return (
      <div className="border-t border-border bg-card px-6 py-8 text-center">
        <p className="text-base font-semibold text-foreground">Recebemos seu contato!</p>
        <p className="mt-1 text-sm text-muted-foreground">Em breve alguem vai falar com voce.</p>
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-card px-6 py-8">
      <p className="text-center text-sm font-semibold text-foreground">Quer saber mais? Deixe seu contato</p>
      <form onSubmit={(event) => void handleSubmit(event)} className="mx-auto mt-4 max-w-md space-y-3">
        {/* Honeypot: campo visualmente oculto (clip 1x1px, nao display:none/off-screen, pra nao
            ser um sinal obvio pra bots simples nem gerar scroll horizontal na pagina). */}
        <div
          style={{ position: 'absolute', width: 1, height: 1, margin: -1, padding: 0, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}
          aria-hidden="true"
        >
          <label htmlFor="website">Nao preencha este campo</label>
          <input
            id="website"
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>

        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          placeholder="Seu nome"
          required
          disabled={sending}
          className={inputClassName}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="E-mail"
            disabled={sending}
            className={inputClassName}
          />
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder="Telefone/WhatsApp"
            disabled={sending}
            className={inputClassName}
          />
        </div>
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Mensagem (opcional)"
          disabled={sending}
          className={`${inputClassName} min-h-20 resize-y`}
        />

        {state === 'erro' && error && <p className="text-xs text-destructive">{error}</p>}

        <button
          type="submit"
          disabled={sending}
          className="w-full rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
          style={{ background: accentSolid }}
        >
          {sending ? 'Enviando...' : 'Enviar'}
        </button>
      </form>
    </div>
  );
}

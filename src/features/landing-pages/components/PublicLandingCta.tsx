import type { LandingPageContent } from '../landing-page-content';
import { whatsappDigits } from '../landing-page-content';

interface PublicLandingCtaProps {
  content: LandingPageContent;
  interactive: boolean;
}

export function PublicLandingCta({ content, interactive }: PublicLandingCtaProps) {
  const { finalCta, whatsapp, contactEmail, location, secondaryColor, primaryColor } = content;

  const footerBackground = secondaryColor
    ? `color-mix(in oklch, ${secondaryColor} 12%, transparent)`
    : primaryColor
      ? `color-mix(in oklch, ${primaryColor} 10%, transparent)`
      : 'var(--color-surface)';

  const digits = whatsappDigits(whatsapp);
  const whatsappHref = interactive && digits ? `https://wa.me/${digits}` : null;
  const emailHref = interactive && contactEmail ? `mailto:${contactEmail}` : null;

  if (!finalCta && !whatsapp && !contactEmail && !location) return null;

  return (
    <div className="border-t border-border px-6 py-8 text-center" style={{ background: footerBackground }}>
      {finalCta && <p className="text-lg font-bold text-foreground">{finalCta}</p>}
      {(whatsapp || contactEmail || location) && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {whatsapp &&
            (whatsappHref ? (
              <a href={whatsappHref} target="_blank" rel="noreferrer" className="font-semibold text-primary hover:underline">
                WhatsApp: {whatsapp}
              </a>
            ) : (
              <span>WhatsApp: {whatsapp}</span>
            ))}
          {contactEmail &&
            (emailHref ? (
              <a href={emailHref} className="font-semibold text-primary hover:underline">
                {contactEmail}
              </a>
            ) : (
              <span>{contactEmail}</span>
            ))}
          {location && <span>{location}</span>}
        </div>
      )}
    </div>
  );
}

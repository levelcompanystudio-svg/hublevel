import type { LandingPageContent } from '../landing-page-content';
import { whatsappDigits } from '../landing-page-content';

interface PublicLandingHeroProps {
  content: LandingPageContent;
  interactive: boolean;
}

export function PublicLandingHero({ content, interactive }: PublicLandingHeroProps) {
  const { displayName, headline, subheadline, heroCta, logoUrl, heroImageUrl, primaryColor, whatsapp, contactEmail } = content;

  const heroBackground = primaryColor
    ? `radial-gradient(600px circle at 50% -10%, color-mix(in oklch, ${primaryColor} 35%, black) 0%, black 70%)`
    : 'radial-gradient(600px circle at 50% -10%, color-mix(in oklch, var(--color-primary) 30%, black) 0%, black 70%)';
  const accentSolid = primaryColor ?? 'var(--color-primary)';

  const digits = whatsappDigits(whatsapp);
  const ctaHref = interactive ? (digits ? `https://wa.me/${digits}` : contactEmail ? `mailto:${contactEmail}` : null) : null;

  return (
    <div className="px-6 py-10 text-center sm:py-14" style={{ background: heroBackground }}>
      {logoUrl && (
        <img
          src={logoUrl}
          alt={displayName}
          loading="lazy"
          referrerPolicy="no-referrer"
          className="mx-auto mb-4 h-12 max-w-[160px] object-contain"
        />
      )}
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: accentSolid }}>
        {displayName}
      </p>
      <h1 className="mx-auto mt-2 max-w-2xl text-2xl font-bold text-white sm:text-3xl">
        {headline || 'Headline ainda nao definida'}
      </h1>
      {subheadline && <p className="mx-auto mt-3 max-w-xl text-sm text-white/80">{subheadline}</p>}
      {heroCta &&
        (ctaHref ? (
          <a
            href={ctaHref}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-block rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110"
            style={{ background: accentSolid }}
          >
            {heroCta}
          </a>
        ) : (
          <button
            type="button"
            disabled
            className="mt-6 cursor-default rounded-lg px-5 py-2.5 text-sm font-semibold text-white shadow-lg"
            style={{ background: accentSolid }}
          >
            {heroCta}
          </button>
        ))}
      {heroImageUrl && (
        <img
          src={heroImageUrl}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="mx-auto mt-8 max-h-64 w-full max-w-xl rounded-lg object-cover"
        />
      )}
    </div>
  );
}

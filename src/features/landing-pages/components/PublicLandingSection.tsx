import type { LandingPageContent } from '../landing-page-content';

interface PublicLandingSectionProps {
  content: LandingPageContent;
}

// Bloco de "beneficios" + secoes textuais geradas (copy ou briefing). Um unico componente porque
// as duas coisas sao, na pratica, o mesmo tipo de conteudo (texto de oferta), so com formatos
// visuais diferentes (lista vs. blocos de texto).
export function PublicLandingSection({ content }: PublicLandingSectionProps) {
  const { benefits, sections, primaryColor } = content;
  const accentSolid = primaryColor ?? 'var(--color-primary)';

  if (benefits.length === 0 && sections.length === 0) return null;

  return (
    <>
      {benefits.length > 0 && (
        <div className="border-t border-border bg-card px-6 py-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Beneficios</p>
          <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
            {benefits.map((benefit, index) => (
              <li key={`${benefit}-${index}`} className="flex items-start gap-2 text-sm text-foreground">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: accentSolid }} aria-hidden="true" />
                {benefit}
              </li>
            ))}
          </ul>
        </div>
      )}

      {sections.length > 0 && (
        <div className="space-y-4 border-t border-border bg-card-elevated px-6 py-6">
          {sections.map((section, index) => (
            <div key={`${section.title}-${index}`}>
              <p className="text-sm font-semibold text-foreground">{section.title}</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

import type { LandingPageContent } from '../landing-page-content';

interface PublicLandingFaqProps {
  content: LandingPageContent;
}

export function PublicLandingFaq({ content }: PublicLandingFaqProps) {
  if (content.faq.length === 0) return null;

  return (
    <div className="border-t border-border bg-card px-6 py-6">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Perguntas frequentes</p>
      <div className="mt-3 space-y-3">
        {content.faq.map((item, index) => (
          <div key={`${item.question}-${index}`}>
            <p className="text-sm font-semibold text-foreground">{item.question}</p>
            {item.answer && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{item.answer}</p>}
          </div>
        ))}
      </div>
    </div>
  );
}

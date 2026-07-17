import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { buildLandingPageContent } from '../landing-page-content';
import { getPublicLandingPage } from '../landing-page-public.api';
import type { PublicLandingPageData } from '../landing-page-public.api';
import { PublicLandingCta } from '../components/PublicLandingCta';
import { PublicLandingFaq } from '../components/PublicLandingFaq';
import { PublicLandingHero } from '../components/PublicLandingHero';
import { PublicLandingSection } from '../components/PublicLandingSection';

// Rota publica /lp/:id - sem login, sem sidebar/topbar do app. Usa o `id` da landing page como
// identificador temporario (nao existe coluna `slug` em `client_landing_pages` ainda; ver
// relatorio da etapa para a recomendacao de migration futura). Nao ha controle real de
// "publicado" no banco hoje (o botao Publicar continua desabilitado), entao qualquer landing
// page existente pode ser aberta por este link - por isso o aviso de "preview publico" abaixo.
export function PublicLandingPage() {
  const { id } = useParams();
  const [data, setData] = useState<PublicLandingPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        setNotFound(false);
        const result = await getPublicLandingPage(id!);
        if (!active) return;
        if (!result) {
          setNotFound(true);
          return;
        }
        setData(result);
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar a pagina.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-9 w-9 animate-spin rounded-full border-2 border-border border-t-primary" aria-label="Carregando" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background px-6 text-center">
        <p className="text-lg font-semibold text-destructive">Nao foi possivel carregar esta pagina</p>
        <p className="max-w-sm text-sm text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-2 bg-background px-6 text-center">
        <p className="text-lg font-semibold text-foreground">Pagina nao encontrada</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          Esta landing page nao existe, foi removida, ou o link esta incorreto.
        </p>
      </div>
    );
  }

  const content = buildLandingPageContent(data.page, data.generatedContent);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-warning/40 bg-warning/10 px-4 py-2 text-center text-xs font-semibold text-warning">
        Preview publico temporario - esta pagina ainda nao esta em um dominio proprio nem foi publicada oficialmente.
      </div>

      <div className="mx-auto max-w-3xl sm:my-10">
        <div className="overflow-hidden sm:rounded-xl sm:border sm:border-border">
          <PublicLandingHero content={content} interactive />
          <PublicLandingSection content={content} />
          <PublicLandingFaq content={content} />
          <PublicLandingCta content={content} interactive />
        </div>
      </div>

      <footer className="border-t border-border px-6 py-6 text-center text-xs text-muted-foreground">
        Pagina gerada pelo HubLevel.
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Badge, Button, Card } from '../../../components/ui';
import type { ClientLandingPage } from '../landing-page.types';

interface LandingPagePublicationPanelProps {
  page: ClientLandingPage | null;
  busy: boolean;
  error: string | null;
  onPublish: () => void;
  onUnpublish: () => void;
}

export function LandingPagePublicationPanel({
  page,
  busy,
  error,
  onPublish,
  onUnpublish,
}: LandingPagePublicationPanelProps) {
  const published = page?.status === 'published';
  const publicPath = page ? `/lp/${page.slug ?? page.id}` : null;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Publicacao</h3>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Publique a landing page para liberar o formulario publico de leads. Rascunhos salvos continuam visiveis
            apenas dentro do HubLevel.
          </p>
        </div>
        <Badge tone={published ? 'success' : page ? 'warning' : 'neutral'}>
          {published ? 'Publicada' : page ? 'Nao publicada' : 'Sem briefing salvo'}
        </Badge>
      </div>

      {error && (
        <p className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {published && publicPath && (
          <Link to={publicPath} target="_blank" rel="noreferrer">
            <Button type="button" variant="secondary">
              Abrir pagina publicada
            </Button>
          </Link>
        )}
        {!published ? (
          <Button type="button" variant="primary" disabled={!page || busy} onClick={onPublish}>
            {busy ? 'Publicando...' : 'Publicar landing page'}
          </Button>
        ) : (
          <Button type="button" variant="secondary" disabled={busy} onClick={onUnpublish}>
            {busy ? 'Atualizando...' : 'Despublicar'}
          </Button>
        )}
      </div>

      {published && page?.slug && (
        <p className="mt-3 break-all text-xs text-muted-foreground">
          URL publica: <span className="font-semibold text-foreground">/lp/{page.slug}</span>
        </p>
      )}
    </Card>
  );
}

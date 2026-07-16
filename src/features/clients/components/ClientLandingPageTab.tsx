import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { createClientLandingPage, getClientLandingPage, updateClientLandingPage } from '../../landing-pages/landing-page.api';
import { LandingPageBriefingForm } from '../../landing-pages/components/LandingPageBriefingForm';
import { LandingPageFutureActions } from '../../landing-pages/components/LandingPageFutureActions';
import { LandingPageLeadsInfo } from '../../landing-pages/components/LandingPageLeadsInfo';
import { initialValuesForClient, landingPageToValues } from '../../landing-pages/landing-page.types';
import type { ClientLandingPage, LandingPageBriefingValues } from '../../landing-pages/landing-page.types';
import type { Client } from '../clients.types';

interface ClientLandingPageTabProps {
  client: Client;
  canManage: boolean;
}

export function ClientLandingPageTab({ client, canManage }: ClientLandingPageTabProps) {
  const { profile } = useAuth();
  const [page, setPage] = useState<ClientLandingPage | null>(null);
  const [values, setValues] = useState<LandingPageBriefingValues>(() => initialValuesForClient(client));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      if (!canManage) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const existing = await getClientLandingPage(client.id);
        if (!active) return;
        setPage(existing);
        setValues(existing ? landingPageToValues(existing) : initialValuesForClient(client));
      } catch (err: unknown) {
        if (active) setError(err instanceof Error ? err.message : 'Erro ao carregar briefing da landing page.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();

    return () => {
      active = false;
    };
  }, [canManage, client.id]);

  async function handleSubmit() {
    if (!profile || !canManage) return;

    try {
      setSaving(true);
      setSaveError(null);
      const saved = page
        ? await updateClientLandingPage(page.id, values, profile.id)
        : await createClientLandingPage(client.id, values, profile.id);
      setPage(saved);
      setValues(landingPageToValues(saved));
      setSavedAt(Date.now());
    } catch (err: unknown) {
      setSaveError(err instanceof Error ? err.message : 'Erro ao salvar briefing da landing page.');
    } finally {
      setSaving(false);
    }
  }

  if (!canManage) return <AccessDeniedPlaceholder />;

  if (loading) return <LoadingState title="Carregando briefing da landing page" />;
  if (error) return <ErrorState description={error} />;

  return (
    <div className="space-y-4">
      {saveError && <ErrorState title="Erro ao salvar" description={saveError} />}
      {savedAt && !saving && !saveError && (
        <div className="flex items-center gap-2 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-success">
          <Badge tone="success">Salvo</Badge>
          Briefing salvo com sucesso.
        </div>
      )}
      <LandingPageBriefingForm
        values={values}
        status={page?.status ?? null}
        saving={saving}
        onChange={setValues}
        onSubmit={() => void handleSubmit()}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <LandingPageFutureActions />
        <LandingPageLeadsInfo />
      </div>
    </div>
  );
}

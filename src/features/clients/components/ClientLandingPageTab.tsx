import { useEffect, useState } from 'react';
import { ErrorState } from '../../../components/feedback/ErrorState';
import { LoadingState } from '../../../components/feedback/LoadingState';
import { Badge } from '../../../components/ui';
import { AccessDeniedPlaceholder } from '../../app/placeholders/AccessDeniedPlaceholder';
import { useAuth } from '../../auth/useAuth';
import { getLandingPageAiErrorMessage } from '../../landing-pages/landing-page-ai.errors';
import { generateLandingPageCopy, getLatestLandingPageAiGeneration } from '../../landing-pages/landing-page-ai.api';
import type { LandingPageAiGeneration } from '../../landing-pages/landing-page-ai.types';
import { analyzeBriefingDocument } from '../../landing-pages/landing-page-analysis.api';
import { createClientLandingPage, getClientLandingPage, updateClientLandingPage } from '../../landing-pages/landing-page.api';
import { LandingPageBriefingAnalysis } from '../../landing-pages/components/LandingPageBriefingAnalysis';
import { LandingPageBriefingDocuments } from '../../landing-pages/components/LandingPageBriefingDocuments';
import { LandingPageBriefingForm } from '../../landing-pages/components/LandingPageBriefingForm';
import { LandingPageFutureActions } from '../../landing-pages/components/LandingPageFutureActions';
import { LandingPageGeneratedContent } from '../../landing-pages/components/LandingPageGeneratedContent';
import { LandingPageLeadsInfo } from '../../landing-pages/components/LandingPageLeadsInfo';
import { LandingPagePreview } from '../../landing-pages/components/LandingPagePreview';
import { applyBriefingAnalysisToValues, initialValuesForClient, landingPageToValues } from '../../landing-pages/landing-page.types';
import type {
  ClientLandingPage,
  LandingPageBriefingAnalysisResult,
  LandingPageBriefingAnalysisStatus,
  LandingPageBriefingValues,
} from '../../landing-pages/landing-page.types';
import type { Document } from '../../documents/documents.types';
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
  const [generation, setGeneration] = useState<LandingPageAiGeneration | null>(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [referenceDocument, setReferenceDocument] = useState<Document | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<LandingPageBriefingAnalysisStatus>('idle');
  const [analysisResult, setAnalysisResult] = useState<LandingPageBriefingAnalysisResult | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

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
        const [existing, latestGeneration] = await Promise.all([
          getClientLandingPage(client.id),
          getLatestLandingPageAiGeneration(client.id),
        ]);
        if (!active) return;
        setPage(existing);
        setValues(existing ? landingPageToValues(existing) : initialValuesForClient(client));
        setGeneration(latestGeneration);
        setReferenceDocument(null);
        setAnalysisStatus('idle');
        setAnalysisResult(null);
        setAnalysisError(null);
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

  function handleSelectReference(document: Document) {
    setReferenceDocument(document);
    setAnalysisStatus('ready');
    setAnalysisResult(null);
    setAnalysisError(null);
  }

  async function handleAnalyze() {
    if (!referenceDocument) return;

    try {
      setAnalysisStatus('analyzing');
      setAnalysisError(null);
      const result = await analyzeBriefingDocument({
        clientId: client.id,
        documentId: referenceDocument.id,
        externalUrl: referenceDocument.external_url,
        title: referenceDocument.title,
      });
      setAnalysisResult(result);
      setAnalysisStatus('analyzed');
    } catch (err: unknown) {
      const rawMessage = err instanceof Error ? err.message : 'Erro ao analisar o briefing com IA.';
      setAnalysisError(getLandingPageAiErrorMessage(rawMessage));
      setAnalysisStatus('error');
    }
  }

  function handleApplyAnalysis() {
    if (!analysisResult) return;
    setValues((current) => applyBriefingAnalysisToValues(current, analysisResult));
    setAnalysisStatus('applied');
  }

  async function handleGenerate() {
    if (!canManage || !page) return;

    try {
      setGenerating(true);
      setGenerateError(null);
      const result = await generateLandingPageCopy(client.id);
      setGeneration(result);
    } catch (err: unknown) {
      setGenerateError(err instanceof Error ? err.message : 'Erro ao gerar conteudo com IA.');
    } finally {
      setGenerating(false);
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
      <LandingPageBriefingDocuments
        clientId={client.id}
        canManage={canManage}
        selectedDocumentId={referenceDocument?.id ?? null}
        onSelectReference={handleSelectReference}
      />
      <LandingPageBriefingAnalysis
        selectedDocument={referenceDocument}
        status={analysisStatus}
        analysis={analysisResult}
        error={analysisError}
        onAnalyze={() => void handleAnalyze()}
        onApply={handleApplyAnalysis}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <LandingPageFutureActions
          canGenerate={canManage}
          generating={generating}
          generateDisabledReason={!page ? 'Salve o briefing antes de gerar com IA' : undefined}
          generateError={generateError}
          onGenerate={() => void handleGenerate()}
        />
        <LandingPageLeadsInfo />
      </div>
      {generation && <LandingPageGeneratedContent generation={generation} />}
      <LandingPagePreview page={page} generation={generation} />
    </div>
  );
}

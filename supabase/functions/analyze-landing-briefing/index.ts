// HubLevel Edge Function: analyze-landing-briefing
//
// Analisa um documento de briefing ja anexado ao cliente (public.documents, type = 'briefing')
// e devolve um resumo estruturado (LandingPageBriefingAnalysisResult) para o usuario revisar e,
// se quiser, aplicar manualmente ao formulario de briefing da landing page.
//
// Escopo desta function, de proposito:
// - So le e retorna texto estruturado. Nao publica nada, nao gera pagina, nao salva a analise
//   em nenhuma tabela (nao existe tabela para isso ainda e nao foi pedida nesta etapa).
// - A chave da IA (OPENAI_API_KEY) fica somente nesta function, como variavel de ambiente do
//   projeto Supabase (`supabase secrets set OPENAI_API_KEY=...`). Nunca e enviada ao frontend.
// - O cliente Supabase usado aqui e criado com o token JWT do usuario que chamou a function, entao
//   toda leitura (clients/documents/client_landing_pages) passa pela RLS normal - a mesma que
//   protege o resto do app. Nao usamos service role key para dados de negocio.
// - Tenta ler o conteudo do `external_url` do briefing (best effort, so texto/HTML simples, com
//   limite de tamanho e timeout). Se o link nao puder ser lido (PDF binario, exige login, bloqueado
//   por CORS/robots, etc.), a analise segue apenas com titulo + dados ja cadastrados do cliente,
//   e isso fica marcado no resultado.

import { createClient, type SupabaseClient } from 'jsr:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface RequestBody {
  client_id?: string;
  document_id?: string;
  external_url?: string;
  file_url?: string;
  title?: string;
}

interface ClientRow {
  id: string;
  company_name: string;
  trade_name: string | null;
  segment: string | null;
}

interface LandingPageRow {
  display_name: string | null;
  segment: string | null;
  headline: string | null;
  subheadline: string | null;
  offer_description: string | null;
  main_cta: string | null;
  faq: string[] | null;
  observations: string | null;
}

interface DocumentRow {
  id: string;
  client_id: string;
  type: string;
  title: string;
  external_url: string | null;
  file_url: string | null;
}

const MAX_FETCHED_CONTENT_CHARS = 12000;
const FETCH_TIMEOUT_MS = 8000;

const ANALYSIS_SYSTEM_PROMPT = `Voce e um estrategista de marketing que le briefings de clientes e extrai um resumo
estruturado para montar uma landing page. Responda ESTRITAMENTE em JSON valido, no formato:
{
  "companyName": string | null,
  "segment": string | null,
  "audience": string | null,
  "offer": string | null,
  "services": string[],
  "differentiators": string[],
  "painPoints": string[],
  "objections": string[],
  "faq": [{ "question": string, "answer": string }],
  "toneOfVoice": string | null,
  "suggestedCta": string | null,
  "landingPageSections": [{ "title": string, "body": string }]
}
Use null ou array vazio quando a informacao nao estiver disponivel no material fornecido. Nao invente dados que
nao aparecem no material ou no contexto do cliente. Nao inclua nenhum texto fora do JSON. Escreva em portugues
do Brasil.`;

async function tryFetchExternalContent(url: string): Promise<{ content: string | null; note: string }> {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return { content: null, note: 'O link informado precisa comecar com http:// ou https://.' };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    const response = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    clearTimeout(timeout);

    if (!response.ok) {
      return { content: null, note: `Nao foi possivel abrir o link (HTTP ${response.status}).` };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/') && !contentType.includes('json')) {
      return { content: null, note: `Link aponta para um arquivo do tipo "${contentType || 'desconhecido'}", que nao pode ser lido automaticamente ainda (ex.: PDF, imagem, ou exige login).` };
    }

    let text = await response.text();
    if (contentType.includes('html')) {
      text = text
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    }

    if (!text.trim()) {
      return { content: null, note: 'O link foi aberto, mas nao tinha texto legivel.' };
    }

    return { content: text.slice(0, MAX_FETCHED_CONTENT_CHARS), note: 'Conteudo do link lido automaticamente.' };
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'erro desconhecido';
    return { content: null, note: `Nao foi possivel ler o conteudo do link automaticamente (${reason}).` };
  }
}

async function tryDownloadStoredContent(
  supabase: SupabaseClient,
  path: string,
): Promise<{ content: string | null; note: string }> {
  const extension = path.split('.').pop()?.toLowerCase() ?? '';

  if (extension !== 'txt' && extension !== 'md') {
    return {
      content: null,
      note: `Arquivo salvo no HubLevel (${extension || 'sem extensao'}) ainda nao tem leitura automatica nesta etapa. TXT e MD ja podem ser lidos; PDF/DOCX ficam anexados para uso e parser futuro.`,
    };
  }

  const { data, error } = await supabase.storage.from('client-documents').download(path);
  if (error) {
    return { content: null, note: `Nao foi possivel baixar o arquivo salvo no HubLevel (${error.message}).` };
  }

  const text = (await data.text()).replace(/\s+/g, ' ').trim();
  if (!text) {
    return { content: null, note: 'O arquivo salvo no HubLevel foi aberto, mas nao tinha texto legivel.' };
  }

  return {
    content: text.slice(0, MAX_FETCHED_CONTENT_CHARS),
    note: 'Conteudo do arquivo salvo no HubLevel lido automaticamente.',
  };
}

function buildPrompt(
  client: ClientRow,
  page: LandingPageRow | null,
  documentTitle: string,
  fetchedContent: string | null,
  fetchNote: string,
): string {
  const lines = [
    `Empresa: ${page?.display_name || client.trade_name || client.company_name}`,
    page?.segment || client.segment ? `Segmento ja cadastrado: ${page?.segment || client.segment}` : null,
    `Titulo do briefing anexado: ${documentTitle}`,
    `Status da leitura do arquivo: ${fetchNote}`,
    page?.headline ? `Headline ja preenchida no briefing manual: ${page.headline}` : null,
    page?.subheadline ? `Subheadline ja preenchida: ${page.subheadline}` : null,
    page?.offer_description ? `Descricao da oferta ja preenchida: ${page.offer_description}` : null,
    page?.main_cta ? `CTA ja preenchido: ${page.main_cta}` : null,
    page?.faq && page.faq.length > 0 ? `FAQ ja levantada:\n${page.faq.map((item) => `- ${item}`).join('\n')}` : null,
    page?.observations ? `Observacoes ja registradas: ${page.observations}` : null,
    fetchedContent ? `Conteudo do briefing anexado (extraido do link):\n${fetchedContent}` : null,
  ].filter(Boolean);

  return lines.join('\n');
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401);
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!supabaseUrl || !supabaseAnonKey) {
      return json({ error: 'Supabase environment not configured for this function.' }, 500);
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;
    const { client_id: clientId, document_id: documentId } = body;

    if (!clientId || !documentId) {
      return json({ error: 'client_id and document_id are required' }, 400);
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, roles(name)')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError || !profile) {
      return json({ error: 'Profile not found' }, 403);
    }

    const roleRelation = Array.isArray(profile.roles) ? profile.roles[0] : profile.roles;
    const role = roleRelation?.name;
    if (role !== 'admin' && role !== 'gestor') {
      return json({ error: 'Forbidden: only admin or gestor can analyze a briefing.' }, 403);
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, company_name, trade_name, segment')
      .eq('id', clientId)
      .is('deleted_at', null)
      .maybeSingle<ClientRow>();

    if (clientError) return json({ error: clientError.message }, 500);
    if (!client) return json({ error: 'Client not found or access denied.' }, 404);

    const { data: document, error: documentError } = await supabase
      .from('documents')
      .select('id, client_id, type, title, external_url, file_url')
      .eq('id', documentId)
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .maybeSingle<DocumentRow>();

    if (documentError) return json({ error: documentError.message }, 500);
    if (!document || document.type !== 'briefing') {
      return json({ error: 'Briefing not found or access denied.' }, 404);
    }

    const { data: landingPage } = await supabase
      .from('client_landing_pages')
      .select('display_name, segment, headline, subheadline, offer_description, main_cta, faq, observations')
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .maybeSingle<LandingPageRow>();

    if (!openaiApiKey) {
      return json({ error: 'IA nao configurada neste ambiente (OPENAI_API_KEY ausente).' }, 503);
    }

    let fetchedContent: string | null = null;
    let fetchNote = 'Nenhum arquivo ou link informado.';
    if (document.file_url) {
      const result = await tryDownloadStoredContent(supabase, document.file_url);
      fetchedContent = result.content;
      fetchNote = result.note;
    }
    if (!fetchedContent && document.external_url) {
      const result = await tryFetchExternalContent(document.external_url);
      fetchedContent = result.content;
      fetchNote = `${fetchNote} Link externo: ${result.note}`;
    }

    const model = 'gpt-4o-mini';
    const prompt = buildPrompt(client, landingPage ?? null, document.title, fetchedContent, fetchNote);

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: ANALYSIS_SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.4,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      return json({ error: `Falha ao analisar o briefing com IA. OpenAI error ${aiResponse.status}: ${errorText}`.slice(0, 2000) }, 502);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData?.choices?.[0]?.message?.content;

    let analysis: unknown;
    try {
      analysis = JSON.parse(rawContent);
    } catch {
      return json({ error: 'Resposta da IA em formato invalido.' }, 502);
    }

    return json({ analysis, fetch_note: fetchNote }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro interno.' }, 500);
  }
});

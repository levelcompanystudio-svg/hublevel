// HubLevel Edge Function: generate-landing-page-copy
//
// Gera um rascunho textual de landing page (headline, secoes, beneficios, FAQ, CTAs) a partir
// do briefing ja salvo em `client_landing_pages`, usando um provedor de IA (OpenAI por padrao).
//
// Escopo desta function, de proposito:
// - Gera SOMENTE conteudo textual/estrutural. Nao cria pagina publica, nao publica nada, nao
//   captura leads.
// - A chave da IA (OPENAI_API_KEY) fica somente nesta function, como variavel de ambiente do
//   projeto Supabase (`supabase secrets set OPENAI_API_KEY=...`). Nunca e enviada ao frontend.
// - O cliente Supabase usado aqui e criado com o token JWT do usuario que chamou a function
//   (repassado no header Authorization), entao toda leitura de `clients`/`client_landing_pages`
//   passa pela RLS normal — a mesma que protege o resto do app. Nao usamos a service role key
//   para ler dados de negocio, so para validar caminho e permitir os inserts nas policies de
//   `landing_page_ai_generations` (a policy de insert do gestor ja exige generated_by = auth.uid()
//   e user_can_access_client(client_id), entao mesmo com o client "de usuario" a RLS decide).

import { createClient } from 'jsr:@supabase/supabase-js@2';

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
}

interface ClientRow {
  id: string;
  company_name: string;
  trade_name: string | null;
  segment: string | null;
}

interface LandingPageRow {
  id: string;
  client_id: string;
  status: string;
  display_name: string | null;
  legal_name: string | null;
  segment: string | null;
  city: string | null;
  state: string | null;
  headline: string | null;
  subheadline: string | null;
  offer_description: string | null;
  main_cta: string | null;
  whatsapp: string | null;
  contact_email: string | null;
  faq: string[] | null;
  observations: string | null;
}

interface RecentUpdateRow {
  title: string;
  description: string;
}

const SYSTEM_PROMPT = `Voce e um copywriter especialista em landing pages de alta conversao para pequenas e
medias empresas no Brasil. A partir do briefing estruturado fornecido, gere um rascunho de
conteudo textual para uma landing page. Responda ESTRITAMENTE em JSON valido, no formato:
{
  "headline": string,
  "subheadline": string,
  "hero_cta": string,
  "sections": [{ "title": string, "body": string }],
  "benefits": [string],
  "faq": [{ "question": string, "answer": string }],
  "final_cta": string
}
Nao inclua nenhum texto fora do JSON. Escreva em portugues do Brasil, tom profissional e direto.`;

function buildPrompt(client: ClientRow, page: LandingPageRow, recentUpdates: RecentUpdateRow[]): string {
  const lines = [
    `Empresa: ${page.display_name || client.trade_name || client.company_name}`,
    page.legal_name ? `Razao social: ${page.legal_name}` : null,
    page.segment || client.segment ? `Segmento: ${page.segment || client.segment}` : null,
    page.city || page.state ? `Localizacao: ${[page.city, page.state].filter(Boolean).join('/')}` : null,
    page.headline ? `Headline sugerida pelo cliente: ${page.headline}` : null,
    page.subheadline ? `Subheadline sugerida: ${page.subheadline}` : null,
    page.offer_description ? `Descricao da oferta: ${page.offer_description}` : null,
    page.main_cta ? `CTA principal desejado: ${page.main_cta}` : null,
    page.whatsapp ? `WhatsApp de contato: ${page.whatsapp}` : null,
    page.contact_email ? `E-mail de contato: ${page.contact_email}` : null,
    page.faq && page.faq.length > 0 ? `Duvidas frequentes ja levantadas:\n${page.faq.map((item) => `- ${item}`).join('\n')}` : null,
    page.observations ? `Observacoes adicionais: ${page.observations}` : null,
    recentUpdates.length > 0
      ? `Atualizacoes recentes de contexto:\n${recentUpdates.map((update) => `- ${update.title}: ${update.description}`).join('\n')}`
      : null,
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

    // Cliente "de usuario": RLS decide o que pode ser lido/escrito, nunca a service role key.
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
    const clientId = body.client_id;
    if (!clientId) {
      return json({ error: 'client_id is required' }, 400);
    }

    // Valida papel do usuario (admin/gestor). Colaborador nunca deve chegar aqui: mesmo que
    // chegasse, as policies de `clients`/`client_landing_pages`/`landing_page_ai_generations`
    // ja bloqueiam qualquer leitura/escrita para esse papel.
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
      return json({ error: 'Forbidden: only admin or gestor can generate landing page copy.' }, 403);
    }

    // Leitura via RLS: se o usuario (gestor) nao tiver acesso a este cliente, vem null.
    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id, company_name, trade_name, segment')
      .eq('id', clientId)
      .is('deleted_at', null)
      .maybeSingle<ClientRow>();

    if (clientError) {
      return json({ error: clientError.message }, 500);
    }
    if (!client) {
      return json({ error: 'Client not found or access denied.' }, 404);
    }

    const { data: landingPage, error: landingPageError } = await supabase
      .from('client_landing_pages')
      .select('*')
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .maybeSingle<LandingPageRow>();

    if (landingPageError) {
      return json({ error: landingPageError.message }, 500);
    }
    if (!landingPage) {
      return json({ error: 'Salve o briefing da landing page antes de gerar com IA.' }, 400);
    }

    const { data: recentUpdatesData } = await supabase
      .from('updates')
      .select('title, description')
      .eq('client_id', clientId)
      .is('deleted_at', null)
      .order('update_date', { ascending: false })
      .limit(3);

    const recentUpdates = (recentUpdatesData ?? []) as RecentUpdateRow[];

    const inputSnapshot = {
      client: { company_name: client.company_name, trade_name: client.trade_name, segment: client.segment },
      briefing: landingPage,
      recent_updates: recentUpdates,
    };

    async function saveGeneration(status: 'generated' | 'failed', generatedContent: unknown, errorMessage: string | null, model: string | null) {
      return supabase
        .from('landing_page_ai_generations')
        .insert({
          client_landing_page_id: landingPage!.id,
          client_id: clientId,
          status,
          provider: 'openai',
          model,
          prompt_version: 'v1',
          input_snapshot: inputSnapshot,
          generated_content: generatedContent ?? {},
          error_message: errorMessage,
          generated_by: user.id,
        })
        .select()
        .single();
    }

    if (!openaiApiKey) {
      await saveGeneration('failed', {}, 'OPENAI_API_KEY not configured in this environment.', null);
      return json({ error: 'IA nao configurada neste ambiente (OPENAI_API_KEY ausente).' }, 503);
    }

    const model = 'gpt-4o-mini';
    const prompt = buildPrompt(client, landingPage, recentUpdates);

    const aiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      await saveGeneration('failed', {}, `OpenAI error ${aiResponse.status}: ${errorText}`.slice(0, 2000), model);
      return json({ error: 'Falha ao gerar conteudo com IA.' }, 502);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData?.choices?.[0]?.message?.content;

    let generatedContent: unknown;
    try {
      generatedContent = JSON.parse(rawContent);
    } catch {
      await saveGeneration('failed', {}, 'Resposta da IA em formato invalido (nao era JSON).', model);
      return json({ error: 'Resposta da IA em formato invalido.' }, 502);
    }

    const { data: saved, error: saveError } = await saveGeneration('generated', generatedContent, null, model);

    if (saveError || !saved) {
      return json({ error: saveError?.message ?? 'Erro ao salvar geracao.' }, 500);
    }

    return json({ generation: saved }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro interno.' }, 500);
  }
});

// HubLevel Edge Function: create-landing-page-lead
//
// Segunda function do projeto sem exigir login (verify_jwt = false em supabase/config.toml),
// porque e chamada pelo formulario da landing page publica /lp/:id.
//
// Regras de seguranca deste arquivo (nao alterar sem revisar o motivo de cada uma):
// - So esta function pode criar um lead. Nao existe policy de insert publica em
//   `landing_page_leads` (migration 024) - a tabela so aceita insert via service role, usada
//   estritamente aqui, nunca no frontend.
// - `client_id` NUNCA vem do corpo da requisicao: e sempre resolvido aqui, a partir do
//   `landing_page_id`, consultando `client_landing_pages` com a service role. Isso evita que
//   alguem forje um lead vinculado a um cliente diferente do da landing page real.
// - Honeypot (`website`): campo que so um bot preencheria (fica escondido no formulario real).
//   Se vier preenchido, respondemos { ok: true } normalmente e NAO inserimos nada - assim o bot
//   nao aprende que foi detectado.
// - Tamanho de campos e limitado aqui (defesa contra payload de flood).
// - Nao guardamos IP bruto (nem hash) nesta primeira versao - so `user_agent`, por ser menos
//   sensivel e ainda util para identificar submissao automatizada.
// - A resposta de sucesso e sempre so `{ ok: true }` - nunca devolve o lead criado nem qualquer
//   dado de outros leads/clientes.

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
  landing_page_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  message?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  website?: string; // honeypot
}

const MAX_LENGTHS = {
  name: 200,
  email: 254,
  phone: 40,
  message: 3000,
  utm: 200,
};

function clip(value: string | undefined, max: number): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
      return json({ error: 'Supabase environment not configured for this function.' }, 500);
    }

    const body = (await req.json().catch(() => ({}))) as RequestBody;

    // Honeypot: bot preencheu o campo escondido. Finge sucesso, nao insere nada.
    if (body.website && body.website.trim() !== '') {
      return json({ ok: true }, 200);
    }

    const landingPageId = body.landing_page_id;
    if (!landingPageId) {
      return json({ error: 'landing_page_id is required' }, 400);
    }

    const name = clip(body.name, MAX_LENGTHS.name);
    const email = clip(body.email, MAX_LENGTHS.email);
    const phone = clip(body.phone, MAX_LENGTHS.phone);
    const message = clip(body.message, MAX_LENGTHS.message);
    const utmSource = clip(body.utm_source, MAX_LENGTHS.utm);
    const utmMedium = clip(body.utm_medium, MAX_LENGTHS.utm);
    const utmCampaign = clip(body.utm_campaign, MAX_LENGTHS.utm);
    const utmContent = clip(body.utm_content, MAX_LENGTHS.utm);
    const utmTerm = clip(body.utm_term, MAX_LENGTHS.utm);

    if (!name) {
      return json({ error: 'Informe seu nome.' }, 400);
    }
    if (!email && !phone) {
      return json({ error: 'Informe um e-mail ou telefone para contato.' }, 400);
    }
    if (email && !EMAIL_PATTERN.test(email)) {
      return json({ error: 'Informe um e-mail valido.' }, 400);
    }

    // Service role: uso restrito e local a esta function. Resolve client_id a partir da landing
    // page (nunca confia em client_id vindo do frontend) e insere o lead, bypassando RLS de forma
    // controlada (a tabela nao tem nenhuma policy de insert publica).
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { data: landingPage, error: landingPageError } = await supabase
      .from('client_landing_pages')
      .select('id, client_id, status')
      .eq('id', landingPageId)
      .is('deleted_at', null)
      .maybeSingle<{ id: string; client_id: string; status: string }>();

    if (landingPageError) return json({ error: landingPageError.message }, 500);
    if (!landingPage) return json({ error: 'Landing page not found.' }, 404);
    if (landingPage.status !== 'published') return json({ error: 'Landing page is not published.' }, 404);

    const userAgent = clip(req.headers.get('user-agent') ?? undefined, 500);

    const { error: insertError } = await supabase.from('landing_page_leads').insert({
      landing_page_id: landingPage.id,
      client_id: landingPage.client_id,
      name,
      email,
      phone,
      message,
      source: 'landing_page',
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      utm_content: utmContent,
      utm_term: utmTerm,
      user_agent: userAgent,
    });

    if (insertError) return json({ error: insertError.message }, 500);

    return json({ ok: true }, 200);
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro interno.' }, 500);
  }
});

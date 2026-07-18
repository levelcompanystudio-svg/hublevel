// HubLevel Edge Function: get-public-landing-page
//
// Unica function do projeto que roda sem exigir login (verify_jwt = false em supabase/config.toml)
// porque serve a rota publica /lp/:slug. Isso e necessario porque a RLS de `client_landing_pages` e
// `landing_page_ai_generations` so libera leitura para admin/gestor autenticados (correto para o
// resto do app) - nao existe (e nao criamos aqui) nenhuma policy publica nessas tabelas.
//
// Em vez de abrir uma brecha na RLS, esta function usa a SERVICE ROLE KEY (que so existe aqui,
// nunca no frontend) exclusivamente para buscar UMA landing page pelo id e devolver um payload
// com uma lista BRANCA (whitelist) de campos seguros para exibicao publica - nunca a linha
// inteira, nunca dados de outras tabelas, nunca informacao interna (created_by, updated_by,
// client_id, observacoes internas etc.).
//
// A function so devolve landing pages com status = 'published'. Rascunhos e paginas prontas,
// mas nao publicadas, respondem como nao encontradas.

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
  id?: string;
}

interface LandingPageRow {
  id: string;
  status: string;
  slug: string | null;
  display_name: string | null;
  headline: string | null;
  subheadline: string | null;
  offer_description: string | null;
  main_cta: string | null;
  whatsapp: string | null;
  contact_email: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  logo_url: string | null;
  hero_image_url: string | null;
  faq: string[] | null;
  city: string | null;
  state: string | null;
}

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
    const identifier = body.id?.trim();
    if (!identifier) {
      return json({ error: 'id is required' }, 400);
    }

    // Service role: uso restrito e local a esta function, so para bypassar RLS nesta leitura
    // pontual e devolver campos whitelisted. Nunca e enviada ao cliente.
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(identifier);
    const pageQuery = supabase
      .from('client_landing_pages')
      .select(
        'id, status, slug, display_name, headline, subheadline, offer_description, main_cta, whatsapp, contact_email, primary_color, secondary_color, logo_url, hero_image_url, faq, city, state',
      )
      .eq('status', 'published')
      .is('deleted_at', null);

    const { data: page, error: pageError } = await (isUuid ? pageQuery.eq('id', identifier) : pageQuery.eq('slug', identifier))
      .maybeSingle<LandingPageRow>();

    if (pageError) return json({ error: pageError.message }, 500);
    if (!page) return json({ error: 'Landing page not found.' }, 404);

    const { data: generation } = await supabase
      .from('landing_page_ai_generations')
      .select('generated_content, status, created_at')
      .eq('client_landing_page_id', page.id)
      .eq('status', 'generated')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return json(
      {
        page,
        generated_content: generation?.generated_content ?? null,
      },
      200,
    );
  } catch (err) {
    return json({ error: err instanceof Error ? err.message : 'Erro interno.' }, 500);
  }
});

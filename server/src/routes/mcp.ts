import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { randomUUID } from 'node:crypto';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { z } from 'zod';
import { env } from '../env.js';
import { fetchMetaDailyInsights, listMetaAdAccounts } from '../integrations/meta/metaApiClient.js';

function isAuthorized(request: FastifyRequest): boolean {
  if (env.NODE_ENV !== 'production' && !env.MCP_ACCESS_TOKEN) return true;
  const authorization = request.headers.authorization;
  return Boolean(env.MCP_ACCESS_TOKEN && authorization === `Bearer ${env.MCP_ACCESS_TOKEN}`);
}

function jsonText(value: unknown): { type: 'text'; text: string } {
  return { type: 'text', text: JSON.stringify(value, null, 2) };
}

function buildMcpServer(): McpServer {
  const server = new McpServer({
    name: 'HubLevel Meta Ads',
    version: '1.0.0',
  });

  server.registerTool(
    'meta_list_ad_accounts',
    {
      title: 'Listar contas Meta Ads',
      description: 'Use para listar todas as contas de anuncio acessiveis pelo usuario do sistema da Level Company.',
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async () => ({ content: [jsonText({ accounts: await listMetaAdAccounts() })] }),
  );

  server.registerTool(
    'meta_get_daily_insights',
    {
      title: 'Consultar metricas diarias Meta Ads',
      description: 'Use para buscar investimento, impressoes, alcance, cliques, CTR, CPC, CPM e acoes por dia de uma conta de anuncio.',
      inputSchema: {
        ad_account_id: z.string().min(1).describe('ID da conta, com ou sem o prefixo act_.'),
        since: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Data inicial no formato YYYY-MM-DD.'),
        until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).describe('Data final no formato YYYY-MM-DD.'),
      },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ ad_account_id, since, until }) => ({
      content: [jsonText({ ad_account_id, since, until, insights: await fetchMetaDailyInsights(ad_account_id, since, until) })],
    }),
  );

  return server;
}

async function handleMcpRequest(request: FastifyRequest, reply: FastifyReply): Promise<void> {
  if (!env.MCP_ACCESS_TOKEN && env.NODE_ENV === 'production') {
    await reply.status(503).send({ error: 'MCP_ACCESS_TOKEN nao configurado no servidor.' });
    return;
  }

  if (!isAuthorized(request)) {
    await reply.status(401).send({ error: 'Unauthorized MCP request.' });
    return;
  }

  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true,
  });
  const server = buildMcpServer();

  reply.hijack();
  try {
    await server.connect(transport);
    await transport.handleRequest(request.raw, reply.raw, request.body);
  } catch (error) {
    request.log.error({ error, requestId: randomUUID() }, 'MCP request failed');
    if (!reply.raw.headersSent) {
      reply.raw.writeHead(500, { 'content-type': 'application/json' });
      reply.raw.end(JSON.stringify({ error: 'MCP request failed.' }));
    }
  }
}

export async function mcpRoutes(app: FastifyInstance): Promise<void> {
  app.all('/mcp', handleMcpRequest);
}

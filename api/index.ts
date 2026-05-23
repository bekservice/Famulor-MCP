/**
 * Vercel serverless entrypoint for the Famulor MCP server.
 *
 * Routes:
 *   GET  /                                          → human-readable landing page
 *   GET  /health                                    → liveness check
 *   GET  /.well-known/oauth-authorization-server    → RFC 8414 metadata
 *   GET  /.well-known/oauth-protected-resource      → RFC 9728 metadata
 *   POST /register                                  → RFC 7591 dynamic client registration
 *   GET  /authorize                                 → renders API-key entry form
 *   POST /authorize                                 → exchanges the API key for an authorization code
 *   POST /token                                     → exchanges authorization code for an access token (PKCE)
 *   POST /mcp                                       → Streamable HTTP MCP transport (client → server)
 *   GET  /mcp                                       → Streamable HTTP MCP transport (optional server stream)
 *   DELETE /mcp                                     → Streamable HTTP MCP transport (session close)
 *
 * Tokens are stateless — the Famulor API key is encrypted (AES-256-GCM) into
 * the access token using MCP_SECRET. No database is required.
 */

import express, { Request, Response } from 'express';
import { randomBytes } from 'node:crypto';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { setupFamulorServer } from '../src/server.js';
import {
  generateClientId,
  issueAuthCode,
  issueAccessToken,
  issueRefreshToken,
  consumeAuthCode,
  verifyAccessToken,
  verifyRefreshToken,
  OAuthError,
} from '../src/auth/oauth.js';
import { renderAuthorizePage } from '../src/auth/authorizePage.js';
import { FAMULOR_LOGO_PNG, FAMULOR_LOGO_MEDIA_TYPE } from '../src/auth/logo.js';
import { FAMULOR_INSTRUCTIONS } from '../src/auth/instructions.js';

const app = express();

app.use(express.json({ limit: '4mb' }));
app.use(express.urlencoded({ extended: true }));

function resolveIssuer(req: Request): string {
  const envIssuer = process.env.MCP_ISSUER;
  if (envIssuer) return envIssuer.replace(/\/$/, '');
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const host = (req.headers['x-forwarded-host'] as string) || req.headers.host;
  return `${proto}://${host}`;
}

function cors(res: Response) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Mcp-Session-Id, WWW-Authenticate');
}

app.use((req, res, next) => {
  cors(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  next();
});

// ─── Public metadata ──────────────────────────────────────────────────────────

// Legacy SSE-style probes: clients sometimes probe these paths before falling
// back to Streamable HTTP. Return 404 (clean "not here") with a JSON pointer
// to the real endpoint — never 4xx-error and never text/html.
app.all(['/sse', '/messages', '/events'], (req, res) => {
  const issuer = resolveIssuer(req);
  res.status(404).json({
    error: 'not_found',
    error_description:
      'This server uses Streamable HTTP, not SSE. Configure your client with the URL below.',
    mcp_endpoint: `${issuer}/mcp`,
    transport: 'streamable-http',
  });
});

app.get('/', (req, res) => {
  const issuer = resolveIssuer(req);
  // Non-browser probes (no text/html in Accept) get a 200 with a JSON
  // pointer to the real MCP endpoint. Returning a 4xx here makes ChatGPT's
  // tool-scan abort; returning text/html makes it complain about content type.
  // A 200 + application/json with a self-describing body satisfies both.
  const accept = (req.headers.accept ?? '').toLowerCase();
  if (!accept.includes('text/html')) {
    res.status(200).json({
      service: 'famulor-mcp',
      version: '0.2.0',
      transport: 'streamable-http',
      mcp_endpoint: `${issuer}/mcp`,
      oauth_metadata: `${issuer}/.well-known/oauth-authorization-server`,
      resource_metadata: `${issuer}/.well-known/oauth-protected-resource`,
    });
    return;
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.end(`<!doctype html>
<html><head><meta charset="utf-8"><title>Famulor MCP</title>
<link rel="icon" href="/logo.png" type="image/png" />
<style>
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:680px;margin:60px auto;padding:0 20px;color:#111;line-height:1.6}
code{background:#f4f4f6;padding:2px 6px;border-radius:4px;font-size:90%}
pre{background:#f4f4f6;padding:14px 16px;border-radius:8px;overflow-x:auto}
h1{font-size:26px;margin:0}
a{color:#0c8fc4}
.header{display:flex;align-items:center;gap:14px;margin-bottom:24px}
.header img{width:44px;height:44px;border-radius:10px}
</style>
</head><body>
<div class="header">
  <img src="/logo.png" alt="Famulor" />
  <h1>Famulor MCP server</h1>
</div>
<p>Connect this server in your MCP client to control your Famulor voice agents, leads, calls, campaigns and knowledge bases.</p>
<p>In Claude Code:</p>
<pre><code>claude mcp add --transport http famulor ${issuer}/mcp</code></pre>
<p>You'll be prompted to authorize — paste your <a href="https://app.famulor.de/api-keys" target="_blank">Famulor API key</a> on the screen that opens.</p>
<p>Endpoints: <code>/mcp</code> · <code>/.well-known/oauth-authorization-server</code> · <code>/.well-known/oauth-protected-resource</code></p>
</body></html>`);
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'famulor-mcp', version: '0.2.0' });
});

// ChatGPT App Store domain verification — the OpenAI Apps directory probes
// /.well-known/openai-apps-challenge and expects the configured token back
// as text/plain. The token is set per environment in OPENAI_APPS_CHALLENGE_TOKEN.
app.get('/.well-known/openai-apps-challenge', (_req, res) => {
  const token = process.env.OPENAI_APPS_CHALLENGE_TOKEN;
  if (!token) {
    res.status(404).type('text/plain').send('OPENAI_APPS_CHALLENGE_TOKEN env var is not set on this deployment.');
    return;
  }
  res.type('text/plain').send(token);
});

app.get(['/logo.png', '/logo.svg', '/favicon.ico'], (_req, res) => {
  // All three paths serve the same official Famulor app icon (PNG).
  // /logo.svg kept for backwards compatibility with the old route name.
  res.setHeader('Content-Type', FAMULOR_LOGO_MEDIA_TYPE);
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
  res.end(FAMULOR_LOGO_PNG);
});

app.get('/.well-known/oauth-authorization-server', (req, res) => {
  const issuer = resolveIssuer(req);
  res.json({
    issuer,
    authorization_endpoint: `${issuer}/authorize`,
    token_endpoint: `${issuer}/token`,
    registration_endpoint: `${issuer}/register`,
    response_types_supported: ['code'],
    grant_types_supported: ['authorization_code', 'refresh_token'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none', 'client_secret_post', 'client_secret_basic'],
    // ChatGPT Apps SDK uses this hint to choose between Client ID Metadata
    // Documents (CIMD) and Dynamic Client Registration. We use DCR, not CIMD.
    client_id_metadata_document_supported: false,
    scopes_supported: ['mcp'],
    service_documentation: 'https://docs.famulor.io',
    op_policy_uri: 'https://famulor.de/privacy',
    op_tos_uri: 'https://famulor.de/terms',
    logo_uri: `${issuer}/logo.png`,
  });
});

function resourceMetadata(req: Request) {
  const issuer = resolveIssuer(req);
  return {
    resource: `${issuer}/mcp`,
    authorization_servers: [issuer],
    scopes_supported: ['mcp'],
    bearer_methods_supported: ['header'],
    resource_name: 'Famulor MCP',
    resource_documentation: 'https://docs.famulor.io',
    resource_logo_uri: `${issuer}/logo.png`,
  };
}

app.get('/.well-known/oauth-protected-resource', (req, res) => {
  res.json(resourceMetadata(req));
});

// Some MCP clients probe the resource-metadata variant scoped to the resource path.
app.get('/.well-known/oauth-protected-resource/mcp', (req, res) => {
  res.json(resourceMetadata(req));
});

// ─── Dynamic Client Registration (RFC 7591) ──────────────────────────────────

app.post('/register', (req, res) => {
  const body = (req.body || {}) as Record<string, unknown>;
  const issuer = resolveIssuer(req);
  const clientId = generateClientId();
  const clientSecret = `famulor_sec_${randomBytes(24).toString('hex')}`;

  // Echo the requested grant_types if the client asked for any we support.
  // ChatGPT registers with ["authorization_code","refresh_token"] and aborts
  // setup if the server forces ["authorization_code"] only.
  const SUPPORTED_GRANTS = new Set(['authorization_code', 'refresh_token']);
  const requestedGrants = Array.isArray(body.grant_types) ? (body.grant_types as unknown[]) : [];
  const grants = requestedGrants
    .filter((g): g is string => typeof g === 'string')
    .filter((g) => SUPPORTED_GRANTS.has(g));
  const finalGrants = grants.length > 0 ? grants : ['authorization_code', 'refresh_token'];

  const requestedAuthMethod =
    typeof body.token_endpoint_auth_method === 'string'
      ? body.token_endpoint_auth_method
      : 'none';

  res.status(201).json({
    client_id: clientId,
    client_secret: clientSecret,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    client_secret_expires_at: 0, // never expires
    client_name: body.client_name ?? 'Famulor MCP client',
    redirect_uris: body.redirect_uris ?? [],
    grant_types: finalGrants,
    response_types: ['code'],
    token_endpoint_auth_method: requestedAuthMethod,
    scope: typeof body.scope === 'string' ? body.scope : 'mcp',
    logo_uri: `${issuer}/logo.png`,
  });
});

// ─── Authorization (the API-key entry page) ──────────────────────────────────

app.get('/authorize', (req, res) => {
  const q = req.query as Record<string, string | undefined>;
  if (q.response_type && q.response_type !== 'code') {
    return res.status(400).json({ error: 'unsupported_response_type' });
  }
  if (!q.client_id || !q.redirect_uri || !q.code_challenge) {
    return res.status(400).json({
      error: 'invalid_request',
      error_description: 'client_id, redirect_uri and code_challenge are required',
    });
  }
  const html = renderAuthorizePage({
    clientId: q.client_id,
    redirectUri: q.redirect_uri,
    state: q.state ?? '',
    codeChallenge: q.code_challenge,
    codeChallengeMethod: q.code_challenge_method ?? 'S256',
    scope: q.scope ?? 'mcp',
    resource: q.resource,
  });
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(html);
});

app.post('/authorize', async (req, res) => {
  const body = (req.body || {}) as Record<string, string | undefined>;
  const {
    api_key,
    client_id,
    redirect_uri,
    state,
    code_challenge,
    code_challenge_method,
    scope,
    resource,
  } = body;

  if (!api_key || !client_id || !redirect_uri || !code_challenge) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(400).send(
      renderAuthorizePage({
        clientId: client_id ?? '',
        redirectUri: redirect_uri ?? '',
        state: state ?? '',
        codeChallenge: code_challenge ?? '',
        codeChallengeMethod: code_challenge_method ?? 'S256',
        scope: scope ?? 'mcp',
        resource,
        error: 'Missing required fields. Please reload the page from your MCP client.',
      })
    );
    return;
  }

  // Quick API-key sanity check against Famulor — fail fast if the key is bad.
  // Famulor returns 302 → login page for bad keys, so disable redirect-follow
  // and require a 200 with JSON.
  //
  // 429 (rate limit) and 5xx (Famulor outage) are NOT signals that the key is
  // bad — we let those pass through with a benign warning. The token still
  // gets minted; the first real tool call will surface any genuine auth error.
  //
  // Skip the whole probe in dev with SKIP_FAMULOR_VERIFY=1.
  let verifyWarning: string | null = null;
  if (process.env.SKIP_FAMULOR_VERIFY !== '1') try {
    const probe = await fetch('https://app.famulor.de/api/user/me', {
      headers: {
        Authorization: `Bearer ${api_key.trim()}`,
        Accept: 'application/json',
      },
      redirect: 'manual',
    });
    if (probe.status === 200) {
      const ct = probe.headers.get('content-type') ?? '';
      if (!ct.toLowerCase().includes('application/json')) {
        throw new Error('Famulor did not return JSON for the key check.');
      }
      // happy path
    } else if (probe.status === 401 || probe.status === 403) {
      throw new Error(
        'The API key was rejected by Famulor. Double-check it on https://app.famulor.de/api-keys.'
      );
    } else if (probe.status === 429) {
      // Don't block on rate limit — issue the token anyway.
      verifyWarning = 'rate-limited';
    } else if (probe.status >= 500) {
      verifyWarning = `famulor-status-${probe.status}`;
    } else {
      throw new Error(`Famulor responded with HTTP ${probe.status} during key check.`);
    }
  } catch (err) {
    // Only treat as a hard error if it's not a transient/network glitch.
    const msg = err instanceof Error ? err.message : String(err);
    const isTransient =
      msg.includes('fetch failed') || msg.includes('ENOTFOUND') || msg.includes('ETIMEDOUT');
    if (isTransient) {
      verifyWarning = 'famulor-unreachable';
    } else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.status(401).send(
        renderAuthorizePage({
          clientId: client_id,
          redirectUri: redirect_uri,
          state: state ?? '',
          codeChallenge: code_challenge,
          codeChallengeMethod: code_challenge_method ?? 'S256',
          scope: scope ?? 'mcp',
          resource,
          error: `Could not verify API key: ${msg}`,
        })
      );
      return;
    }
  }

  if (verifyWarning) {
    // Log only — don't block the user. The first real tool call validates
    // the key for real against Famulor.
    console.warn(`[authorize] proceeding despite verify warning: ${verifyWarning}`);
  }

  const code = issueAuthCode({
    apiKey: api_key.trim(),
    codeChallenge: code_challenge,
    codeChallengeMethod: (code_challenge_method === 'plain' ? 'plain' : 'S256'),
    clientId: client_id,
    redirectUri: redirect_uri,
  });

  const redirect = new URL(redirect_uri);
  redirect.searchParams.set('code', code);
  if (state) redirect.searchParams.set('state', state);
  res.redirect(302, redirect.toString());
});

// ─── Token exchange ──────────────────────────────────────────────────────────

app.post('/token', (req, res) => {
  const body = (req.body || {}) as Record<string, string | undefined>;
  try {
    if (body.grant_type === 'authorization_code') {
      if (!body.code || !body.code_verifier || !body.redirect_uri || !body.client_id) {
        throw new OAuthError(
          'invalid_request',
          'code, code_verifier, redirect_uri and client_id are required'
        );
      }
      const codePayload = consumeAuthCode({
        code: body.code,
        codeVerifier: body.code_verifier,
        clientId: body.client_id,
        redirectUri: body.redirect_uri,
      });
      const { token, expiresIn } = issueAccessToken(codePayload.api_key, codePayload.client_id);
      const refresh = issueRefreshToken(codePayload.api_key, codePayload.client_id);
      res.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: expiresIn,
        refresh_token: refresh,
        scope: 'mcp',
      });
      return;
    }

    if (body.grant_type === 'refresh_token') {
      if (!body.refresh_token) {
        throw new OAuthError('invalid_request', 'refresh_token is required');
      }
      const refreshPayload = verifyRefreshToken(body.refresh_token);
      if (body.client_id && body.client_id !== refreshPayload.client_id) {
        throw new OAuthError('invalid_grant', 'client_id does not match the refresh token');
      }
      const { token, expiresIn } = issueAccessToken(refreshPayload.api_key, refreshPayload.client_id);
      // Rotate the refresh token on each use (security best practice).
      const rotated = issueRefreshToken(refreshPayload.api_key, refreshPayload.client_id);
      res.json({
        access_token: token,
        token_type: 'Bearer',
        expires_in: expiresIn,
        refresh_token: rotated,
        scope: 'mcp',
      });
      return;
    }

    throw new OAuthError(
      'unsupported_grant_type',
      `grant_type must be authorization_code or refresh_token, got ${body.grant_type ?? '<missing>'}`
    );
  } catch (err) {
    if (err instanceof OAuthError) {
      res.status(err.status === 401 ? 401 : 400).json({
        error: err.code,
        error_description: err.message,
      });
      return;
    }
    const msg = err instanceof Error ? err.message : String(err);
    res.status(400).json({ error: 'invalid_request', error_description: msg });
  }
});

// ─── MCP Streamable HTTP transport ───────────────────────────────────────────

function unauthorized(req: Request, res: Response, description: string) {
  const issuer = resolveIssuer(req);
  res.setHeader(
    'WWW-Authenticate',
    `Bearer realm="famulor-mcp", error="invalid_token", error_description="${description}", resource_metadata="${issuer}/.well-known/oauth-protected-resource"`
  );
  res.status(401).json({
    jsonrpc: '2.0',
    error: { code: -32001, message: description },
    id: null,
  });
}

function extractBearer(req: Request): string | null {
  const h = req.headers.authorization;
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m ? m[1].trim() : null;
}

// JSON-RPC methods that any unauthenticated MCP client may call. ChatGPT
// (and other clients) call these during connector discovery BEFORE the user
// has been through the OAuth flow, so blocking them here aborts the tool
// scan with "MCP SSE probe returned application/json" etc. Only tool
// execution requires a real Famulor token.
const PUBLIC_METHODS = new Set<string>([
  'initialize',
  'ping',
  'notifications/initialized',
  'notifications/cancelled',
  'tools/list',
  'prompts/list',
  'resources/list',
  'resources/templates/list',
  'logging/setLevel',
]);

async function handleMcp(req: Request, res: Response) {
  const body = req.body as { method?: string } | undefined;
  const method = typeof body?.method === 'string' ? body.method : undefined;
  const isPublic = method === undefined || PUBLIC_METHODS.has(method);

  // Try to decode the Bearer token if there is one. For probe methods we
  // accept missing or invalid tokens silently; for tool execution we hard-fail.
  const bearer = extractBearer(req);
  let apiKey: string | null = null;
  if (bearer) {
    try {
      apiKey = verifyAccessToken(bearer).api_key;
    } catch (err) {
      if (!isPublic) {
        const msg = err instanceof Error ? err.message : 'Invalid token';
        return unauthorized(req, res, msg);
      }
    }
  } else if (!isPublic) {
    return unauthorized(req, res, 'Bearer token required');
  }

  const mcpServer = new Server(
    { name: 'famulor-mcp', version: '0.2.0' },
    {
      capabilities: { tools: {} },
      instructions: FAMULOR_INSTRUCTIONS,
    }
  );
  (mcpServer as any).userConfig = apiKey ? { famulor_api_key: apiKey } : {};

  await setupFamulorServer(mcpServer);

  // No enableJsonResponse — let the SDK return text/event-stream (SSE), which
  // is what ChatGPT's MCP SSE probe expects. enableJsonResponse=true forced
  // application/json on every response and caused ChatGPT to abort the scan.
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  res.on('close', () => {
    transport.close().catch(() => undefined);
    mcpServer.close().catch(() => undefined);
  });

  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
}

app.post('/mcp', (req, res) => {
  handleMcp(req, res).catch((err) => {
    if (!res.headersSent) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).json({
        jsonrpc: '2.0',
        error: { code: -32603, message: `Internal error: ${msg}` },
        id: null,
      });
    }
  });
});

app.get('/mcp', (req, res) => {
  handleMcp(req, res).catch((err) => {
    if (!res.headersSent) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).end(`Internal error: ${msg}`);
    }
  });
});

app.delete('/mcp', (req, res) => {
  handleMcp(req, res).catch((err) => {
    if (!res.headersSent) {
      const msg = err instanceof Error ? err.message : String(err);
      res.status(500).end(`Internal error: ${msg}`);
    }
  });
});

// Catch-all 404 for everything else.
app.use((req, res) => {
  res.status(404).json({ error: 'not_found', path: req.path });
});

export default app;

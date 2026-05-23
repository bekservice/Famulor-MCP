# Deployment Guide for Famulor MCP Server

The Famulor MCP server supports two transports:

1. **Streamable HTTP + OAuth 2.0** (recommended) — hosted on Vercel at
   `https://mcp.famulor.io/mcp`. Users connect their MCP client (Claude Code,
   Claude Desktop, Cursor, etc.) and authorize via a browser flow where they
   paste their Famulor API key. The key is encrypted into the access token.
2. **stdio** (local) — for users who want to run the server locally with their
   API key supplied via env var.

---

## Option 1 — Hosted HTTP server on Vercel

### One-time deploy

1. Set the production env vars in Vercel:

   | Variable      | Value                                              |
   | ------------- | -------------------------------------------------- |
   | `MCP_SECRET`  | A long random string (`openssl rand -hex 32`).     |
   | `MCP_ISSUER`  | Your public URL, e.g. `https://mcp.famulor.io`.    |

   `MCP_SECRET` is what encrypts the OAuth access tokens. Rotating it
   invalidates all existing tokens — users will simply re-authorize.

2. Push to the deployment branch. Vercel runs `npm run build` and serves
   everything through `api/index.ts` (see `vercel.json`).

3. Point your custom domain (`mcp.famulor.io`) at the Vercel project.

### Users connect like this

In Claude Code:

```bash
claude mcp add --transport http famulor https://mcp.famulor.io/mcp
```

The first tool call triggers the OAuth flow — Claude Code opens
`https://mcp.famulor.io/authorize` in the browser, the user pastes their
[Famulor API key](https://app.famulor.de/api-keys), and the resulting access
token is stored by Claude Code for future sessions.

Other MCP clients (Claude Desktop, Cursor, Windsurf, Zed, …) use the same flow
because the server publishes RFC 8414 + RFC 9728 OAuth metadata at
`/.well-known/oauth-authorization-server` and
`/.well-known/oauth-protected-resource`.

### Verifying a deployment

```bash
curl https://mcp.famulor.io/health
curl https://mcp.famulor.io/.well-known/oauth-authorization-server | jq
curl -i https://mcp.famulor.io/mcp -X POST                       # → 401 + WWW-Authenticate
```

### Local dev against the same Vercel-style handler

```bash
cp .env.example .env
echo "MCP_SECRET=$(openssl rand -hex 32)" >> .env
npm install
npm run dev:http
# server on http://localhost:8787
```

Then in another shell:

```bash
curl http://localhost:8787/.well-known/oauth-authorization-server
```

---

## Option 2 — stdio (local) for power users

```bash
npm install
npm run build
```

In Claude Desktop's `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "famulor": {
      "command": "node",
      "args": ["/absolute/path/to/famulor-mcp/dist/src/index.js"],
      "env": { "FAMULOR_API_KEY": "fa_..." }
    }
  }
}
```

stdio mode reads `FAMULOR_API_KEY` directly from the process env — no OAuth.

---

## Security notes

- The access token is an AES-256-GCM encrypted blob of `{ kind, api_key, client_id, exp }`. The Famulor API key never lands in any DB.
- PKCE (S256) is enforced on the authorization code exchange.
- The `/authorize` POST does a live `GET /api/user/me` probe against Famulor before issuing the code, so bad keys are rejected immediately.
- CORS is open (`*`) on the OAuth and MCP endpoints — this is required for browser-based MCP clients to call them.

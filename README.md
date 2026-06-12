<p align="center">
  <img src="https://mcp.famulor.io/logo.png" alt="Famulor" width="80" height="80" />
</p>

<h1 align="center">Famulor MCP</h1>

<p align="center">
  Control your Famulor AI voice agents — calls, leads, campaigns, knowledge bases,
  conversations, WhatsApp, SIP trunks — directly from Claude, Cursor, Windsurf, VS Code
  and any other MCP-compatible client.
</p>

<p align="center">
  <a href="https://mcp.famulor.io">mcp.famulor.io</a> ·
  <a href="https://app.famulor.de/api-keys">Get an API key</a> ·
  <a href="https://docs.famulor.io">Docs</a>
</p>

<p align="center">
  <a href="https://github.com/bekservice/Famulor-MCP">
    <img src="https://img.shields.io/badge/GitHub-bekservice%2FFamulor--MCP-181717?logo=github" alt="GitHub" />
  </a>
  <a href="https://www.famulor.io">
    <img src="https://img.shields.io/badge/Famulor-voice%20agents-29C5F6" alt="Famulor" />
  </a>
  <a href="https://modelcontextprotocol.io">
    <img src="https://img.shields.io/badge/protocol-MCP-blueviolet" alt="MCP" />
  </a>
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/hosted%20on-Vercel-000000?logo=vercel" alt="Vercel" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT" />
  </a>
</p>

<p align="center">
  <img src="https://www.famulor.io/_next/image?url=https%3A%2F%2Fanzpxaqhcbkfyqdk.public.blob.vercel-storage.com%2Fblog-images%2F1766256900040-79z4hr1mztw.webp&w=3840&q=75" alt="Famulor AI voice agents" width="100%" />
</p>

---

## Setup

Add the server in your editor, then sign in with your
[Famulor API key](https://app.famulor.de/api-keys) when prompted in the browser.

> **Server URL**: `https://mcp.famulor.io/mcp` is the canonical endpoint.
> Both `https://mcp.famulor.io/` and `https://mcp.famulor.io/mcp` work as MCP
> URLs, so you can paste either into your client's connector dialog.

<details open>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add --transport http famulor https://mcp.famulor.io/mcp
```

Add the server first — authenticate via your [API key](https://app.famulor.de/api-keys) when prompted.
</details>

<details>
<summary><b>Claude Desktop</b></summary>

**Settings > Connectors > Add custom connector**

```
https://mcp.famulor.io/mcp
```

Copy the URL, paste it into the connector dialog, and sign in when prompted.
</details>

<details>
<summary><b>Cursor</b></summary>

`.cursor/mcp.json`

```json
{
  "mcpServers": {
    "famulor": {
      "type": "http",
      "url": "https://mcp.famulor.io/mcp"
    }
  }
}
```

Add the server first — authenticate via your [API key](https://app.famulor.de/api-keys) when prompted.
</details>

<details>
<summary><b>Windsurf</b></summary>

`~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "famulor": {
      "serverUrl": "https://mcp.famulor.io/mcp"
    }
  }
}
```

Add the server first — authenticate via your [API key](https://app.famulor.de/api-keys) when prompted.
</details>

<details>
<summary><b>VS Code</b></summary>

`.vscode/mcp.json`

```json
{
  "servers": {
    "famulor": {
      "type": "http",
      "url": "https://mcp.famulor.io/mcp"
    }
  }
}
```

Add the server first — authenticate via your [API key](https://app.famulor.de/api-keys) when prompted.
</details>

<details>
<summary><b>Cline</b></summary>

**Cline extension > MCP Servers > Configure**

```json
{
  "mcpServers": {
    "famulor": {
      "url": "https://mcp.famulor.io/mcp"
    }
  }
}
```

Add the server first — authenticate via your [API key](https://app.famulor.de/api-keys) when prompted.
</details>

<details>
<summary><b>Continue</b></summary>

`~/.continue/config.yaml`

```yaml
mcpServers:
  - name: famulor
    type: streamable-http
    url: "https://mcp.famulor.io/mcp"
```

Add the server first — authenticate via your [API key](https://app.famulor.de/api-keys) when prompted.
</details>

<details>
<summary><b>OpenClaw</b></summary>

```bash
openclaw mcp add famulor --url https://mcp.famulor.io/mcp --transport streamable-http --auth oauth
openclaw mcp login famulor
```

Or in `~/.openclaw/openclaw.json`:

```json
{
  "mcp": {
    "servers": {
      "famulor": {
        "url": "https://mcp.famulor.io/mcp",
        "transport": "streamable-http",
        "auth": "oauth"
      }
    }
  }
}
```

Tip: there is also a ready-made Famulor skill — `openclaw skills install famulor-skill`.
</details>

<details>
<summary><b>Hermes Agent</b></summary>

```bash
hermes mcp add famulor --url https://mcp.famulor.io/mcp
hermes mcp login famulor
```

Or in `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  famulor:
    url: "https://mcp.famulor.io/mcp"
    auth: oauth
```

Apply in-session with `/reload-mcp`.
</details>

<details>
<summary><b>npx (stdio, any MCP client)</b></summary>

Run the server locally via npm — no hosted endpoint needed. Uses your
[Famulor API key](https://app.famulor.de/api-keys) directly:

```json
{
  "mcpServers": {
    "famulor": {
      "command": "npx",
      "args": ["-y", "famulor-mcp"],
      "env": { "FAMULOR_API_KEY": "your-api-key" }
    }
  }
}
```

</details>

<details>
<summary><b>Zed</b></summary>

`~/.config/zed/settings.json`

```json
{
  "context_servers": {
    "famulor": {
      "args": [
        "-y",
        "mcp-remote@latest",
        "https://mcp.famulor.io/mcp"
      ],
      "command": "npx"
    }
  }
}
```

Add the server first — authenticate via your [API key](https://app.famulor.de/api-keys) when prompted.
</details>

---

## What you can do

Once connected, your AI assistant can call any of the **66 tools** spanning the full
Famulor API. A non-exhaustive tour:

**Assistants** — create, update, delete AI voice agents · list voices, languages, LLM/multimodal models, TTS/STT providers · toggle inbound and conversation-ended webhooks

**Calls** — make outbound calls · list / get / delete call records

**Campaigns** — create campaigns, manage retry rules and allowed-hours windows · start, stop and delete

**Leads** — add leads (incl. secondary contacts) · update status and merge variables · delete

**Knowledge bases** — create knowledge bases · upload website-scraped documents · update / delete

**Phone numbers** — search by country and dial pattern · purchase · release · SIP trunk CRUD

**Conversations** — list, read and reply to chat conversations · enable/disable AI per conversation for human takeover

**WhatsApp** — list senders and templates · check 24h session window · send template or freeform messages

**SMS** — send via your purchased numbers

**Mid-call tools** — register custom HTTP integrations the assistant can call mid-conversation

**AI Replies** — generate context-aware replies for external chat platforms

Ask the assistant in plain English, e.g. *"Create a German sales assistant using GPT-4.1-mini and the Susi voice"*, *"Start campaign #42 and add these 50 leads"*, *"Show me all calls today where the goal wasn't reached."*

---

## How auth works

The server speaks the standard MCP OAuth 2.1 flow (RFC 8414 metadata, RFC 7591
Dynamic Client Registration, PKCE S256). Your MCP client opens a browser tab,
you paste your Famulor API key, and the client receives an access token that
the server encrypts with AES-256-GCM. **Your API key never lands in any
database** — it lives only inside the token your client stores.

Tokens expire after 30 days; your client simply re-prompts.

---

## Self-hosting

The hosted server at `https://mcp.famulor.io` works out of the box, but you can
run your own if you prefer.

### Deploy to Vercel

```bash
git clone https://github.com/bekservice/Famulor-MCP.git
cd Famulor-MCP
vercel --prod
```

Set these env vars in the Vercel project:

| Variable      | Required | Value                                                |
| ------------- | -------- | ---------------------------------------------------- |
| `MCP_SECRET`  | yes      | `openssl rand -hex 32` — encrypts OAuth tokens.      |
| `MCP_ISSUER`  | rec.     | Your public URL, e.g. `https://mcp.example.com`.     |

Then point your domain at the deployment and you're live. See
[DEPLOYMENT.md](./DEPLOYMENT.md) for the full guide including stdio mode for
power users.

### Local dev

```bash
npm install
echo "MCP_SECRET=$(openssl rand -hex 32)" > .env
npm run dev:http
# server on http://localhost:8787
```

```bash
# health
curl http://localhost:8787/health

# OAuth metadata
curl http://localhost:8787/.well-known/oauth-authorization-server
```

---

## License

MIT

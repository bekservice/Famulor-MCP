<p align="center">
  <img src="https://app.famulor.io/famulor-mcp-logo.svg" alt="Famulor" width="80" height="80" />
</p>

<h1 align="center">Famulor MCP</h1>

<p align="center">
  Connect Claude, Codex, Cursor, VS Code, and other MCP clients to the complete
  tenant-safe Famulor platform API.
</p>

<p align="center">
  <a href="https://app.famulor.io/mcp">MCP endpoint</a> ·
  <a href="https://app.famulor.io/settings?panel=apikeys">API &amp; MCP settings</a> ·
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
  <a href="LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-green" alt="MIT" />
  </a>
</p>

<p align="center">
  <img src="https://www.famulor.io/_next/image?url=https%3A%2F%2Fanzpxaqhcbkfyqdk.public.blob.vercel-storage.com%2Fblog-images%2F1766256900040-79z4hr1mztw.webp&w=3840&q=75" alt="Famulor AI voice agents" width="100%" />
</p>

---

## Setup

Add the server in your client, then sign in to Famulor and approve the requested
workspace permissions in the browser. Claude and ChatGPT use OAuth; there is no
API key to paste into their connector settings.

> **Server URL**: `https://app.famulor.io/mcp`. It runs inside the Famulor
> platform, so there is nothing to install or host. Your plan needs the
> **Connect AI / MCP** feature; without it the endpoint answers `403`.

<details open>
<summary><b>Claude Code</b></summary>

```bash
claude mcp add --transport http famulor https://app.famulor.io/mcp
```

Add the server first, then complete the browser-based OAuth flow.
</details>

<details>
<summary><b>Claude Desktop</b></summary>

**Settings > Connectors > Add custom connector**

```
https://app.famulor.io/mcp
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
      "url": "https://app.famulor.io/mcp"
    }
  }
}
```

Add the server first, then complete the browser-based OAuth flow.
</details>

<details>
<summary><b>Windsurf</b></summary>

`~/.codeium/windsurf/mcp_config.json`

```json
{
  "mcpServers": {
    "famulor": {
      "serverUrl": "https://app.famulor.io/mcp"
    }
  }
}
```

Add the server first, then complete the browser-based OAuth flow.
</details>

<details>
<summary><b>VS Code</b></summary>

`.vscode/mcp.json`

```json
{
  "servers": {
    "famulor": {
      "type": "http",
      "url": "https://app.famulor.io/mcp"
    }
  }
}
```

Add the server first, then complete the browser-based OAuth flow.
</details>

<details>
<summary><b>Cline</b></summary>

**Cline extension > MCP Servers > Configure**

```json
{
  "mcpServers": {
    "famulor": {
      "url": "https://app.famulor.io/mcp"
    }
  }
}
```

Add the server first, then complete the browser-based OAuth flow.
</details>

<details>
<summary><b>Continue</b></summary>

`~/.continue/config.yaml`

```yaml
mcpServers:
  - name: famulor
    type: streamable-http
    url: "https://app.famulor.io/mcp"
```

Add the server first, then complete the browser-based OAuth flow.
</details>

<details>
<summary><b>OpenClaw</b></summary>

```bash
openclaw mcp add famulor --url https://app.famulor.io/mcp --transport streamable-http --auth oauth
openclaw mcp login famulor
```

Or in `~/.openclaw/openclaw.json`:

```json
{
  "mcp": {
    "servers": {
      "famulor": {
        "url": "https://app.famulor.io/mcp",
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
hermes mcp add famulor --url https://app.famulor.io/mcp
hermes mcp login famulor
```

Or in `~/.hermes/config.yaml`:

```yaml
mcp_servers:
  famulor:
    url: "https://app.famulor.io/mcp"
    auth: oauth
```

Apply in-session with `/reload-mcp`.
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
        "https://app.famulor.io/mcp"
      ],
      "command": "npx"
    }
  }
}
```

Add the server first, then complete the browser-based OAuth flow.
</details>

---

## What you can do

Once connected, your AI assistant discovers the current public tool catalog
directly from Famulor. The catalog covers, among other areas:

**Assistants** — create, update, delete AI voice agents · list voices, languages, LLM/multimodal models, TTS/STT providers · toggle inbound and conversation-ended webhooks

**History & calls** — inspect cross-channel history and transcripts · make and manage calls

**Campaigns** — create campaigns, manage retry rules and allowed-hours windows · start, stop and delete

**Audience** — manage contacts, tags, segments, suppression and campaign membership

**Knowledge bases** — create knowledge bases · upload website-scraped documents · update / delete

**Telephony** — phone numbers, number verification, assignments and SIP trunks

**Messaging & email** — WhatsApp, Instagram, Messenger, Telegram, Slack, Teams,
Discord, Google Chat, X, helpdesk and email conversation workflows

**WhatsApp** — list senders and templates · check 24h session window · send template or freeform messages

**Automations & operations** — flows, routines, dashboards, integrations,
webhooks, booking, workspace settings and account administration

Ask the assistant in plain English, e.g. *"Create a German sales assistant using GPT-4.1-mini and the Susi voice"*, *"Start campaign #42 and add these 50 leads"*, *"Show me all calls today where the goal wasn't reached."*

---

## How auth works

The endpoint implements MCP OAuth discovery, authorization code with PKCE,
dynamic client registration and Client ID Metadata Documents. Your MCP client
opens Famulor in a browser, where you sign in on app.famulor.io, choose a
workspace and approve the requested permissions.

Server-to-server clients can send an API key instead: create one under
**Settings > API & MCP** on app.famulor.io and pass it as
`Authorization: Bearer fam_…`. Claude and ChatGPT connectors always use OAuth.

Full tool catalog and scopes: [docs.famulor.io/mcp/tools-and-scopes](https://docs.famulor.io/mcp/tools-and-scopes)

---

## Famulor 1.0 (app.famulor.de)

This MCP server works with workspaces on the Famulor platform at
**app.famulor.io**. Famulor 1.0 (app.famulor.de) stays available; to bring
assistants, tools, knowledge, campaigns, automations and your own telephony
over, use
[Migrate from Famulor 1.0](https://docs.famulor.io/settings/famulor-migration).

---

## What is in this repository

The server itself runs inside the Famulor platform. This repository holds what
clients and directories need to find it:

| File | Purpose |
| --- | --- |
| `mcp.json`, `.plugin/plugin.json` | Client and plugin configuration pointing at `https://app.famulor.io/mcp` |
| `server.json` | Entry in the official MCP Registry (`io.famulor/famulor-mcp`, remote only) |
| `glama.json` | Glama ownership claim |
| `SUBMISSIONS.md`, `submissions/`, `chatgpt-app-submission.json` | Directory submission material |
| `assets/` | Logos |

The earlier self-hosted server and its npm package `famulor-mcp` are retired.

---

## License

MIT

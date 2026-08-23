# Claude Connectors Directory — Formular-Antworten

Formular: https://clau.de/mcp-directory-submission

## Stammdaten

| Feld | Wert |
|---|---|
| Connector name | Famulor |
| Company / Developer | BEK Service GmbH, Kempten, Germany |
| Contact email | info@bekservice.de |
| MCP Server URL | https://app.famulor.io/mcp |
| Website | https://www.famulor.io |
| Documentation | https://docs.famulor.io |
| Setup guide | https://www.famulor.io/feature/mcp-connector |
| Logo | https://app.famulor.io/famulor-mcp-logo.svg (+ submissions/famulor-logo-400.png) |
| Privacy Policy | https://www.famulor.io/privacy |
| Terms of Service | https://www.famulor.io/terms |
| DPA | https://www.famulor.io/dpa |

## Beschreibung (kurz)

AI agent platform with a full public MCP catalog for assistants, cross-channel
history, calls, campaigns, contacts, knowledge, messaging, automations,
dashboards, and workspace settings.

## Technik-Checkliste (Anforderungen erfüllt?)

- [x] OAuth 2.1 + PKCE (RFC 8414 metadata, RFC 7591 DCR) — `/.well-known/oauth-authorization-server`
- [x] HTTPS / streamable HTTP
- [x] Tool annotations: all discovered tools publish explicit annotations
- [x] Öffentliche Doku live
- [x] Dedicated reviewer account is available; provide its credentials only in
      the private submission form
- [x] OAuth reviewer flow: sign in, choose the isolated review workspace, and
      approve the requested scopes; no API key is pasted into Claude
- [ ] Confirm the current data-handling answers against the public Privacy
      Policy and DPA immediately before submission

## Beispiel-Prompts (für das Formular)

- "Create a German sales assistant with a female voice and GPT-4.1-mini"
- "Start campaign #42 and add these 50 leads"
- "Show me all calls from today where the goal wasn't reached"
- "Send a WhatsApp template to +49170…"

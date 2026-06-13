# Claude Connectors Directory — Formular-Antworten

Formular: https://clau.de/mcp-directory-submission

## Stammdaten

| Feld | Wert |
|---|---|
| Connector name | Famulor |
| Company / Developer | BEK Service GmbH, Kempten, Germany |
| Contact email | info@bekservice.de |
| MCP Server URL | https://mcp.famulor.io/mcp |
| Website | https://www.famulor.io |
| Documentation | https://docs.famulor.io |
| Setup guide | https://www.famulor.io/feature/mcp-connector |
| Logo | https://mcp.famulor.io/logo.png (+ submissions/famulor-logo-400.png) |
| Privacy Policy | https://www.famulor.io/privacy |
| Terms of Service | https://www.famulor.io/terms |
| DPA | https://www.famulor.io/dpa |

## Beschreibung (kurz)

AI voice agent platform. Create phone assistants, make calls, run outbound campaigns, manage leads, knowledge bases (RAG), WhatsApp, SMS and SIP trunks — 75 tools covering the full Famulor API. GDPR-compliant, EU data processing.

## Technik-Checkliste (Anforderungen erfüllt?)

- [x] OAuth 2.1 + PKCE (RFC 8414 metadata, RFC 7591 DCR) — `/.well-known/oauth-authorization-server`
- [x] HTTPS / streamable HTTP
- [x] Tool annotations: alle 75 Tools mit `title` + `readOnlyHint`/`destructiveHint`
- [x] Öffentliche Doku live
- [ ] **Test-Account für Reviewer** — anlegen und Zugangsdaten + Schritt-für-Schritt-Anleitung bereitstellen:
      1. Login auf app.famulor.de mit Test-Credentials
      2. API Keys → Key kopieren
      3. Im OAuth-Flow des Connectors einfügen
- [ ] Data-Handling-Angaben: API-Key wird nie gespeichert (AES-256-GCM-verschlüsselt im Client-Token), Token-Laufzeit 30 Tage, Verarbeitung in der EU (Vercel), keine Weitergabe an Dritte

## Beispiel-Prompts (für das Formular)

- "Create a German sales assistant with a female voice and GPT-4.1-mini"
- "Start campaign #42 and add these 50 leads"
- "Show me all calls from today where the goal wasn't reached"
- "Send a WhatsApp template to +49170…"

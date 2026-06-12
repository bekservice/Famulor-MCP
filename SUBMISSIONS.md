# MCP Registry Submissions — Playbook

Status legend: ☐ open · ☑ done. Alle Befehle aus dem Repo-Root (`~/dev/Famulor-MCP`).

## 0. Voraussetzung: npm-Republish (mcpName)

`package.json` enthält jetzt `"mcpName": "io.famulor/famulor-mcp"` (Ownership-Nachweis für die offizielle Registry):

```bash
npm publish --access public   # publisht 0.3.1
```

## 1. Offizielle MCP Registry (registry.modelcontextprotocol.io)

`server.json` liegt im Repo-Root. Namespace `io.famulor` per DNS-Verifikation:

```bash
brew install mcp-publisher

# Ed25519-Key + DNS TXT Record für famulor.io:
openssl genpkey -algorithm Ed25519 -out mcp-registry-key.pem
echo "famulor.io. IN TXT \"v=MCPv1; k=ed25519; p=$(openssl pkey -in mcp-registry-key.pem -pubout -outform DER | tail -c 32 | base64)\""
# → TXT Record bei deinem DNS-Provider eintragen, dann:
mcp-publisher login dns --domain famulor.io --private-key $(openssl pkey -in mcp-registry-key.pem -noout -text | grep -A3 "priv:" | tail -n +2 | tr -d ' :\n')
mcp-publisher publish

# Verify:
curl https://registry.modelcontextprotocol.io/servers/io.famulor/famulor-mcp
```

Einfachere Alternative ohne DNS: Namespace `io.github.bekservice/famulor-mcp` + `mcp-publisher login github` (dann `name` in server.json und `mcpName` in package.json entsprechend ändern).

## 2. Anthropic Claude Connectors Directory

Formular: https://clau.de/mcp-directory-submission
Anforderungen: OAuth 2.0 ✓, HTTPS ✓, öffentliche Docs ✓. Noch nötig:
- **Test-Account** mit Schritt-für-Schritt-Setup für Reviewer
- **Tool-Annotations**: jedes Tool braucht `title` + `readOnlyHint`/`destructiveHint` (größter Aufwand, ~66 Tools)
- Logo/Favicon, Data-Handling-Angaben
Eskalation: mcp-directory@anthropic.com

## 3. Smithery (smithery.ai)

Remote-Server eintragen: https://smithery.ai/new → `https://mcp.famulor.io/mcp`
Oder CLI: `smithery mcp publish "https://mcp.famulor.io/mcp" -n @bekservice/famulor-mcp`
Wichtig: Server muss bei unauthentifizierten Requests **401 (nicht 403)** liefern. Danach Settings → Verification für den Vendor-Badge.

## 4. Glama (glama.ai)

`glama.json` liegt im Repo-Root (Org-Repos müssen so claimen). Nur committen + pushen — Glama indexiert automatisch.

## 5. Docker MCP Catalog

PR an https://github.com/docker/mcp-registry (Remote-Track, kein Dockerfile nötig):

```bash
gh repo fork docker/mcp-registry --clone && cd mcp-registry
task remote-wizard   # erstellt servers/famulor/ (server.yaml type: remote, oauth, tools.json: [])
task catalog -- famulor   # lokal testen
# PR öffnen; Test-Credentials via deren Google Form
```

## 6. Cline MCP Marketplace

Issue mit Template auf https://github.com/cline/mcp-marketplace → "MCP Server Submission":
Repo-URL, **400×400 PNG Logo**, Begründung, Bestätigung dass Cline das Setup allein aus dem README schafft.

## 7. Cursor Directory

https://cursor.directory/plugins/new → mit GitHub einloggen, Repo-URL einreichen (Auto-Review).
Deeplink ist schon auf der Landing-Page eingebaut.

## 8. Hermes Agent Catalog (Nous Research)

PR an https://github.com/NousResearch/hermes-agent — neue Datei `optional-mcps/famulor/manifest.yaml`:

```yaml
manifest_version: 1
source: https://github.com/bekservice/Famulor-MCP
transport:
  url: https://mcp.famulor.io/mcp
  auth: oauth
```

(Format vor dem PR an bestehenden Manifesten in `optional-mcps/` ausrichten.) Nach Merge: `hermes mcp install famulor`.

## 9. Verzeichnisse (Formulare, je 2 Min.)

- mcp.so → https://mcp.so/submit
- PulseMCP → https://www.pulsemcp.com/submit
- mcpservers.org → https://mcpservers.org/submit
- MCP Market → https://mcpmarket.com/submit

## 10. GitHub MCP Registry (github.com/mcp)

Kuratiert. Nach Schritt 1: Nominierung per Mail an partnerships@github.com.

## Nicht möglich / nicht nötig

- **ClawHub**: listet keine MCP-Server (nur Skills/Plugins) — abgedeckt durch den famulor-skill, dessen Anleitung `openclaw mcp add` enthält.
- **modelcontextprotocol/servers**: Community-Liste ist geschlossen, verweist auf die offizielle Registry (Schritt 1).
- **LobeHub, mcp.directory etc.**: scrapen automatisch GitHub + offizielle Registry.

## Empfohlene Reihenfolge

1. npm republish (0.3.1 mit mcpName) → 2. Offizielle Registry → 3. Claude Directory → 4. Smithery → 5. glama.json pushen → 6. Docker PR → 7. Cline Issue → 8. cursor.directory → 9. Formulare → 10. Hermes PR → 11. GitHub partnerships Mail

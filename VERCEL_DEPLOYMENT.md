# 🚀 Vercel Deployment Guide

Diese Anleitung erklärt, wie du den Famulor MCP Server auf Vercel deployst.

## Voraussetzungen

- Ein Vercel-Konto ([vercel.com](https://vercel.com))
- Ein GitHub-Repository mit dem Code
- Node.js >= 20.0.0

## Deployment-Schritte

### 1. GitHub Repository vorbereiten

Stelle sicher, dass alle Änderungen committed und gepusht sind:

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 2. Vercel-Projekt erstellen

1. Gehe zu [vercel.com](https://vercel.com) und melde dich an
2. Klicke auf "New Project"
3. Wähle dein GitHub-Repository aus (`bekservice/Famulor-MCP`)
4. Wähle den Branch `main`

### 3. Projekt-Konfiguration in Vercel

Vercel sollte automatisch die folgenden Einstellungen erkennen:

- **Framework Preset**: Other (oder automatisch erkannt)
- **Root Directory**: `./` (Standard)
- **Build Command**: `npm run vercel-build` (oder `npm run build`)
- **Output Directory**: `dist` (wird für TypeScript-Kompilierung verwendet)
- **Install Command**: `npm install` (Standard)

### 4. Environment Variables (optional)

Falls du Environment Variables benötigst (z.B. für lokale Tests):

1. Gehe zu Project Settings → Environment Variables
2. Füge Variablen hinzu (z.B. `FAMULOR_API_KEY` für Tests)
3. **WICHTIG**: In Production sollten Benutzer ihre eigenen API-Keys über die ChatGPT/Claude UI eingeben

### 5. Deployment

1. Klicke auf "Deploy"
2. Warte, bis der Build abgeschlossen ist
3. Nach erfolgreichem Deployment erhältst du eine URL wie: `https://famulor-mcp.vercel.app`

## Verfügbare Endpoints

Nach dem Deployment sind folgende Endpoints verfügbar:

- **Health Check**: `https://your-app.vercel.app/health`
- **SSE Endpoint**: `https://your-app.vercel.app/sse`

## Projekt-Struktur

```
Famulor-MCP/
├── api/
│   └── index.ts          # Vercel Serverless Function
├── src/
│   ├── server.ts         # MCP Server Setup
│   ├── server-http.ts    # Express Server (für andere Plattformen)
│   └── ...
├── vercel.json           # Vercel Konfiguration
└── package.json
```

## Troubleshooting

### Build-Fehler

Wenn der Build fehlschlägt:

1. **Prüfe Node.js Version**: Stelle sicher, dass `engines.node >= 20.0.0` in `package.json` gesetzt ist
2. **Prüfe Build-Logs**: In Vercel Dashboard → Deployments → Build Logs
3. **Lokaler Test**: Führe `npm run build` lokal aus, um Fehler zu finden

### Runtime-Fehler

Wenn die App deployed ist, aber nicht funktioniert:

1. **Prüfe Function Logs**: In Vercel Dashboard → Functions → Logs
2. **Teste Health Endpoint**: `curl https://your-app.vercel.app/health`
3. **Prüfe Environment Variables**: Stelle sicher, dass alle benötigten Variablen gesetzt sind

### TypeScript-Fehler

Wenn TypeScript-Fehler auftreten:

1. Stelle sicher, dass `tsconfig.json` die `api/` Dateien einschließt
2. Führe `npm run build` lokal aus, um Fehler zu sehen
3. Prüfe, ob alle Dependencies installiert sind: `npm install`

## Nächste Schritte

Nach erfolgreichem Deployment:

1. **Teste die Endpoints**: 
   ```bash
   curl https://your-app.vercel.app/health
   ```

2. **Konfiguriere OpenAI App Store** (siehe `ONLINE_DEPLOYMENT.md`):
   - Registriere die App im OpenAI Developer Portal
   - Verwende die Vercel-URL als MCP Server URL
   - Konfiguriere User API Keys

3. **Monitor Deployment**:
   - Überwache Logs in Vercel Dashboard
   - Setze Alerts für Fehler

## Support

Bei Problemen:
- Prüfe die [Vercel Dokumentation](https://vercel.com/docs)
- Siehe `ONLINE_DEPLOYMENT.md` für App Store Konfiguration
- Öffne ein Issue im GitHub Repository


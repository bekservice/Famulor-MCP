/**
 * Renders the OAuth authorization page where the user pastes their Famulor API key.
 *
 * The page is intentionally self-contained — no JS frameworks, no external assets —
 * so it works on Vercel serverless without extra build steps.
 */

export function renderAuthorizePage(params: {
  clientId: string;
  redirectUri: string;
  state: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  scope: string;
  error?: string;
}): string {
  const esc = (s: string) =>
    s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const errorBanner = params.error
    ? `<div class="error">${esc(params.error)}</div>`
    : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <link rel="icon" href="/logo.svg" type="image/svg+xml" />
  <title>Connect Famulor to your MCP client</title>
  <style>
    :root {
      color-scheme: light dark;
      --bg: #0b0d12;
      --panel: #14171f;
      --border: #232734;
      --text: #f5f7fb;
      --muted: #9aa3b2;
      --accent: #5b8def;
      --accent-hover: #4575d8;
      --error: #ff5d6c;
    }
    * { box-sizing: border-box; }
    html, body {
      margin: 0;
      min-height: 100%;
      font-family: -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 16px;
    }
    .card {
      max-width: 480px;
      width: 100%;
      background: var(--panel);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 32px;
      box-shadow: 0 24px 60px rgba(0,0,0,0.35);
    }
    h1 {
      margin: 0 0 8px;
      font-size: 22px;
      font-weight: 600;
    }
    p {
      margin: 0 0 20px;
      color: var(--muted);
      line-height: 1.55;
      font-size: 14px;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 8px;
    }
    input[type="text"], input[type="password"] {
      width: 100%;
      padding: 12px 14px;
      border-radius: 10px;
      border: 1px solid var(--border);
      background: #0f1219;
      color: var(--text);
      font-size: 14px;
      font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace;
    }
    input:focus {
      outline: none;
      border-color: var(--accent);
      box-shadow: 0 0 0 3px rgba(91,141,239,0.25);
    }
    button {
      width: 100%;
      margin-top: 20px;
      padding: 12px 16px;
      border-radius: 10px;
      border: none;
      background: var(--accent);
      color: white;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: background .15s ease;
    }
    button:hover { background: var(--accent-hover); }
    .hint {
      margin-top: 18px;
      font-size: 12px;
      color: var(--muted);
      text-align: center;
    }
    .hint a {
      color: var(--accent);
      text-decoration: none;
    }
    .hint a:hover { text-decoration: underline; }
    .error {
      margin: 0 0 16px;
      padding: 10px 12px;
      background: rgba(255,93,108,0.12);
      border: 1px solid rgba(255,93,108,0.4);
      color: var(--error);
      border-radius: 8px;
      font-size: 13px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 24px;
    }
    .brand-mark {
      width: 36px;
      height: 36px;
      border-radius: 8px;
      display: block;
      flex-shrink: 0;
    }
    .brand-name {
      font-weight: 600;
      font-size: 15px;
    }
  </style>
</head>
<body>
  <form class="card" method="POST" action="/authorize">
    <div class="brand">
      <img class="brand-mark" src="/logo.svg" alt="Famulor" width="36" height="36" />
      <div class="brand-name">Famulor MCP</div>
    </div>

    <h1>Connect your Famulor account</h1>
    <p>Paste your Famulor API key to authorize this MCP client. The key is encrypted into a short-lived access token — it is never stored on our servers.</p>

    ${errorBanner}

    <label for="api_key">Famulor API key</label>
    <input id="api_key" name="api_key" type="password" placeholder="fa_…" autocomplete="off" required autofocus />

    <input type="hidden" name="client_id" value="${esc(params.clientId)}" />
    <input type="hidden" name="redirect_uri" value="${esc(params.redirectUri)}" />
    <input type="hidden" name="state" value="${esc(params.state)}" />
    <input type="hidden" name="code_challenge" value="${esc(params.codeChallenge)}" />
    <input type="hidden" name="code_challenge_method" value="${esc(params.codeChallengeMethod)}" />
    <input type="hidden" name="scope" value="${esc(params.scope)}" />

    <button type="submit">Authorize</button>

    <div class="hint">
      Don't have a key yet? <a href="https://app.famulor.de/api-keys" target="_blank" rel="noopener">Generate one in your Famulor account</a>.
    </div>
  </form>
</body>
</html>`;
}

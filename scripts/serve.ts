/**
 * Local dev HTTP server — mounts the same Express app that runs on Vercel.
 *
 * Usage:
 *   MCP_SECRET=$(openssl rand -hex 32) npm run dev:http
 */

import app from '../api/index.js';

const port = Number(process.env.PORT ?? 8787);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.error(`Famulor MCP listening on http://localhost:${port}`);
});

/**
 * Famulor brand assets served by the MCP server.
 *
 * The PNG is the official Famulor app icon (cyan rounded square + white serif F),
 * embedded at build time so we don't depend on a separate static-files pipeline
 * on Vercel. Loaded from assets/famulor-logo.png relative to this file.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// Walk up from src/auth → src → repo root, then into assets/.
// At runtime on Vercel, the compiled JS lives under dist/src/auth/, so this
// resolves to dist/../../assets/famulor-logo.png — Vercel includes static
// files matched by includeFiles. We try a couple of candidate paths so the
// same code works in source (tsx) and dist (node) modes.
const CANDIDATES = [
  join(HERE, '..', '..', 'assets', 'famulor-logo.png'),       // src/auth → repo
  join(HERE, '..', '..', '..', 'assets', 'famulor-logo.png'), // dist/src/auth → repo
  join(process.cwd(), 'assets', 'famulor-logo.png'),          // cwd fallback
];

function loadLogo(): Buffer {
  for (const p of CANDIDATES) {
    try {
      return readFileSync(p);
    } catch {
      /* try next */
    }
  }
  throw new Error(
    `Famulor logo not found. Tried: ${CANDIDATES.join(', ')}`
  );
}

export const FAMULOR_LOGO_PNG: Buffer = loadLogo();
export const FAMULOR_LOGO_MEDIA_TYPE = 'image/png';

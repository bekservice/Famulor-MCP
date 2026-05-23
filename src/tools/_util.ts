/**
 * Shared helpers for tool handlers.
 */

/**
 * Build a CallToolResult that includes BOTH a text view (for legacy clients
 * and human-friendly display) AND a structuredContent payload that matches
 * the tool's declared outputSchema.
 *
 * Per MCP draft spec, structuredContent MUST be a JSON object — bare arrays
 * and scalars get wrapped under a `result` key so the schema stays valid.
 */
export function textResult(payload: unknown) {
  let structured: Record<string, unknown>;
  if (Array.isArray(payload)) {
    structured = { result: payload };
  } else if (payload !== null && typeof payload === 'object') {
    structured = payload as Record<string, unknown>;
  } else {
    structured = { result: payload };
  }
  return {
    content: [
      {
        type: 'text' as const,
        text: typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2),
      },
    ],
    structuredContent: structured,
  };
}

export function errorResult(error: unknown) {
  const msg = error instanceof Error ? error.message : String(error);
  return {
    content: [{ type: 'text' as const, text: `Error: ${msg}` }],
    isError: true,
  };
}

export function pickDefined<T extends Record<string, unknown>>(input: T): Partial<T> {
  const out: Partial<T> = {};
  for (const [k, v] of Object.entries(input)) {
    if (v !== undefined) {
      (out as Record<string, unknown>)[k] = v;
    }
  }
  return out;
}

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const parts: string[] = [];
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue;
    parts.push(`${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

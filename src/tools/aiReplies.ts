/**
 * AI replies — generate a context-aware AI reply for an external chat.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, pickDefined } from './_util.js';

export async function handleAiReplyTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'generate_ai_reply': {
        const body = pickDefined(args as Record<string, unknown>);
        const result = await client.post('/api/ai/generate-reply', body);
        return textResult(result);
      }

      default:
        throw new Error(`Unknown ai-replies tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

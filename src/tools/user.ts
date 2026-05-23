/**
 * User account tools.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult } from './_util.js';

export async function handleUserTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'get_me': {
        const result = await client.get('/api/user/me');
        return textResult(result);
      }

      default:
        throw new Error(`Unknown user tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

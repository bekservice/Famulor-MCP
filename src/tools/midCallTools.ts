/**
 * Mid-Call Tools — manage mid-call HTTP tools attached to assistants.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, pickDefined } from './_util.js';

export async function handleMidCallToolTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_mid_call_tools': {
        const result = await client.get('/api/user/tools');
        return textResult(result);
      }

      case 'get_mid_call_tool': {
        const { id } = args as { id: number };
        const result = await client.get(`/api/user/tools/${id}`);
        return textResult(result);
      }

      case 'create_mid_call_tool': {
        const body = pickDefined(args as Record<string, unknown>);
        const result = await client.post('/api/user/tools', body);
        return textResult(result);
      }

      case 'update_mid_call_tool': {
        const { id, ...rest } = args as Record<string, unknown> & { id: number };
        const body = pickDefined(rest);
        const result = await client.request(`/api/user/tools/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return textResult(result);
      }

      case 'delete_mid_call_tool': {
        const { id } = args as { id: number };
        const result = await client.delete(`/api/user/tools/${id}`);
        return textResult(result);
      }

      default:
        throw new Error(`Unknown mid-call tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

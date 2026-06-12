/**
 * Labels — tags for assistants. Unlike folders, an assistant can carry
 * multiple labels (via label_ids on the assistant).
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, buildQuery, pickDefined } from './_util.js';

export async function handleLabelTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_labels': {
        const { page, per_page } = args as { page?: number; per_page?: number };
        const result = await client.get(`/api/user/labels${buildQuery({ page, per_page })}`);
        return textResult(result);
      }

      case 'create_label': {
        const body = pickDefined(args as Record<string, unknown>);
        const result = await client.post('/api/user/labels', body);
        return textResult(result);
      }

      case 'update_label': {
        const { id, ...rest } = args as Record<string, unknown> & { id: number };
        const body = pickDefined(rest);
        const result = await client.request(`/api/user/labels/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return textResult(result);
      }

      case 'delete_label': {
        const { id } = args as { id: number };
        const result = await client.delete(`/api/user/labels/${id}`);
        return textResult(result);
      }

      default:
        throw new Error(`Unknown label tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

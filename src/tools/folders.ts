/**
 * Folders — group assistants (e.g. per customer or brand).
 * An assistant can belong to exactly one folder (via folder_id on the assistant).
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, buildQuery, pickDefined } from './_util.js';

export async function handleFolderTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_folders': {
        const { page, per_page } = args as { page?: number; per_page?: number };
        const result = await client.get(`/api/user/folders${buildQuery({ page, per_page })}`);
        return textResult(result);
      }

      case 'create_folder': {
        const body = pickDefined(args as Record<string, unknown>);
        const result = await client.post('/api/user/folders', body);
        return textResult(result);
      }

      case 'update_folder': {
        const { id, ...rest } = args as Record<string, unknown> & { id: number };
        const body = pickDefined(rest);
        const result = await client.request(`/api/user/folders/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return textResult(result);
      }

      case 'delete_folder': {
        const { id } = args as { id: number };
        const result = await client.delete(`/api/user/folders/${id}`);
        return textResult(result);
      }

      default:
        throw new Error(`Unknown folder tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

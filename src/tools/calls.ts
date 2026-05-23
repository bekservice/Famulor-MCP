/**
 * Call Tools — make calls, retrieve, list, delete.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, buildQuery, pickDefined } from './_util.js';

export async function handleCallTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'make_call': {
        const { assistant_id, phone_number, variables } = args as {
          assistant_id: string;
          phone_number: string;
          variables?: Record<string, unknown>;
        };
        const body = pickDefined({ assistant_id, phone_number, variables });
        const result = await client.post('/api/user/make_call', body);
        return textResult(result);
      }

      case 'get_call': {
        const { call_id } = args as { call_id: string };
        const result = await client.get(`/api/user/calls/${call_id}`);
        return textResult(result);
      }

      case 'list_calls': {
        const { assistant_id, page, per_page } = args as {
          assistant_id?: string;
          page?: number;
          per_page?: number;
        };
        const result = await client.get(
          `/api/user/calls${buildQuery({ assistant_id, page, per_page })}`
        );
        return textResult(result);
      }

      case 'delete_call': {
        const { call_id } = args as { call_id: string };
        const result = await client.delete(`/api/user/calls/${call_id}`);
        return textResult(result);
      }

      default:
        throw new Error(`Unknown call tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

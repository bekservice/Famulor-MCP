/**
 * Call Tools
 *
 * Tools for making and managing phone calls via Famulor
 */

import { FamulorClient } from '../auth/famulor.js';

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

          const result = await client.post('/api/user/make_call', {
            assistant_id,
            phone_number,
            variables: variables || {},
          });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

        case 'get_call': {
          const { call_id } = args as { call_id: string };
          const result = await client.get(`/api/user/calls/${call_id}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'list_calls': {
        const { assistant_id, limit = 50 } = args as {
          assistant_id?: string;
          limit?: number;
        };

          let endpoint = `/api/user/calls?limit=${limit}`;
          if (assistant_id) {
            endpoint += `&assistant_id=${assistant_id}`;
          }

        const result = await client.get(endpoint);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown call tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}


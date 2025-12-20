/**
 * Assistant Tools
 *
 * Tools for managing Famulor AI assistants
 */

import { FamulorClient } from '../auth/famulor.js';

export async function handleAssistantTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'get_assistants': {
        const result = await client.get('/api/user/assistants');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_assistant_details': {
        const { assistant_id } = args as { assistant_id: string };
        const result = await client.get(`/api/user/assistants/${assistant_id}`);

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
        throw new Error(`Unknown assistant tool: ${name}`);
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


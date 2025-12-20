/**
 * Conversation Tools
 *
 * Tools for retrieving conversation history from Famulor
 */

import { FamulorClient } from '../auth/famulor.js';

export async function handleConversationTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'get_conversation': {
        const { uuid } = args as { uuid: string };
        const result = await client.get(`/api/conversations/${uuid}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_conversation': {
        const { assistant_id, type, variables } = args as {
          assistant_id: string;
          type?: 'widget' | 'test';
          variables?: Record<string, unknown>;
        };

        const body: Record<string, unknown> = {
          assistant_id,
        };
        if (type !== undefined) body.type = type;
        if (variables !== undefined) body.variables = variables;

        const result = await client.post('/api/conversations', body);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'send_message': {
        const { uuid, message } = args as {
          uuid: string;
          message: string;
        };

        const result = await client.post(
          `/api/conversations/${uuid}/messages`,
          {
            message,
          }
        );

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
        throw new Error(`Unknown conversation tool: ${name}`);
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


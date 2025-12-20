/**
 * SMS Tools
 *
 * Tools for sending SMS messages via Famulor
 */

import { FamulorClient } from '../auth/famulor.js';

export async function handleSmsTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'send_sms': {
        const { from, to, body } = args as {
          from: number;
          to: string;
          body: string;
        };

        const result = await client.post('/api/user/sms', {
          from,
          to,
          body,
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

      default:
        throw new Error(`Unknown SMS tool: ${name}`);
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


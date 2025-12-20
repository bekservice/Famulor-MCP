/**
 * Campaign Tools
 *
 * Tools for managing campaigns in Famulor
 */

import { FamulorClient } from '../auth/famulor.js';

export async function handleCampaignTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_campaigns': {
        const result = await client.get('/api/user/campaigns');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_campaign_status': {
        const { campaign_id, action } = args as {
          campaign_id: number;
          action: 'start' | 'stop';
        };

        const result = await client.post('/api/user/campaigns/update-status', {
          campaign_id,
          action,
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
        throw new Error(`Unknown campaign tool: ${name}`);
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


/**
 * Campaign Tools — list, create, update status, delete.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, pickDefined } from './_util.js';

export async function handleCampaignTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_campaigns': {
        const result = await client.get('/api/user/campaigns');
        return textResult(result);
      }

      case 'create_campaign': {
        const body = pickDefined(args as Record<string, unknown>);
        const result = await client.post('/api/user/campaigns', body);
        return textResult(result);
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
        return textResult(result);
      }

      case 'delete_campaign': {
        const { id } = args as { id: number };
        const result = await client.delete(`/api/user/campaign/${id}`);
        return textResult(result);
      }

      default:
        throw new Error(`Unknown campaign tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

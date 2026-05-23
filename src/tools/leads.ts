/**
 * Lead Tools — list, create, update, delete.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, pickDefined, buildQuery } from './_util.js';

export async function handleLeadTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_leads': {
        const { page, per_page } = args as { page?: number; per_page?: number };
        const result = await client.get(
          `/api/user/leads${buildQuery({ page, per_page })}`
        );
        return textResult(result);
      }

      case 'create_lead': {
        const { phone_number, campaign_id, variables, allow_dupplicate, secondary_contacts } =
          args as {
            phone_number: string;
            campaign_id: number;
            variables?: Record<string, unknown> | Array<Record<string, unknown>>;
            allow_dupplicate?: boolean;
            secondary_contacts?: Array<{ phone_number: string; variables?: Record<string, unknown> }>;
          };
        const body = pickDefined({
          phone_number,
          campaign_id,
          variables,
          allow_dupplicate,
          secondary_contacts,
        });
        const result = await client.post('/api/user/lead', body);
        return textResult(result);
      }

      case 'update_lead': {
        const { id, campaign_id, phone_number, status, variables } = args as {
          id: number;
          campaign_id?: number;
          phone_number?: string;
          status?: 'created' | 'completed' | 'reached-max-retries';
          variables?: Record<string, unknown>;
        };
        const body = pickDefined({ campaign_id, phone_number, status, variables });
        const result = await client.request(`/api/leads/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return textResult(result);
      }

      case 'delete_lead': {
        const { id } = args as { id: number };
        const result = await client.delete(`/api/user/leads/${id}`);
        return textResult(result);
      }

      default:
        throw new Error(`Unknown lead tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

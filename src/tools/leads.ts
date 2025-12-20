/**
 * Lead Tools
 *
 * Tools for managing leads in Famulor
 */

import { FamulorClient } from '../auth/famulor.js';

export async function handleLeadTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_leads': {
        const result = await client.get('/api/user/leads');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'create_lead': {
        const { phone_number, campaign_id, variables, allow_dupplicate } = args as {
          phone_number: string;
          campaign_id: number;
          variables?: Array<Record<string, unknown>>;
          allow_dupplicate?: boolean;
        };

        const result = await client.post('/api/user/lead', {
          phone_number,
          campaign_id,
          variables: variables || [],
          allow_dupplicate: allow_dupplicate ?? false,
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

      case 'update_lead': {
        const { id, campaign_id, phone_number, status, variables } = args as {
          id: number;
          campaign_id?: number;
          phone_number?: string;
          status?: 'created' | 'completed' | 'reached-max-retries';
          variables?: Record<string, unknown>;
        };

        const body: Record<string, unknown> = {};
        if (campaign_id !== undefined) body.campaign_id = campaign_id;
        if (phone_number !== undefined) body.phone_number = phone_number;
        if (status !== undefined) body.status = status;
        if (variables !== undefined) body.variables = variables;

        const result = await client.request<{ message: string }>(
          `/api/leads/${id}`,
          {
            method: 'PUT',
            body: JSON.stringify(body),
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
        throw new Error(`Unknown lead tool: ${name}`);
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


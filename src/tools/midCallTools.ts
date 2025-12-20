/**
 * Mid-Call Tools
 *
 * Tools for managing mid-call actions/tools in Famulor
 */

import { FamulorClient } from '../auth/famulor.js';

export async function handleMidCallToolTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_mid_call_tools': {
        const result = await client.get('/api/user/tools');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_mid_call_tool': {
        const { id } = args as { id: number };
        const result = await client.get(`/api/user/tools/${id}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_mid_call_tool': {
        const {
          id,
          name: toolName,
          description,
          endpoint,
          method,
          timeout,
          headers,
          schema,
        } = args as {
          id: number;
          name?: string;
          description?: string;
          endpoint?: string;
          method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
          timeout?: number;
          headers?: Array<{ name: string; value: string }>;
          schema?: Array<{
            name: string;
            type: 'string' | 'number' | 'boolean';
            description: string;
          }>;
        };

        const body: Record<string, unknown> = {};
        if (toolName !== undefined) body.name = toolName;
        if (description !== undefined) body.description = description;
        if (endpoint !== undefined) body.endpoint = endpoint;
        if (method !== undefined) body.method = method;
        if (timeout !== undefined) body.timeout = timeout;
        if (headers !== undefined) body.headers = headers;
        if (schema !== undefined) body.schema = schema;

        const result = await client.request<{
          message: string;
          data: unknown;
        }>(`/api/user/tools/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
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
        throw new Error(`Unknown mid-call tool: ${name}`);
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


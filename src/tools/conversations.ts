/**
 * Conversation Tools — chat history, send messages, list, enable/disable AI.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, pickDefined, buildQuery } from './_util.js';

export async function handleConversationTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_conversations': {
        const {
          type,
          assistant_id,
          customer_phone,
          whatsapp_sender_phone,
          external_identifier,
          per_page,
          cursor,
        } = args as {
          type?: string;
          assistant_id?: number;
          customer_phone?: string;
          whatsapp_sender_phone?: string;
          external_identifier?: string;
          per_page?: number;
          cursor?: string;
        };
        const result = await client.get(
          `/api/user/conversations${buildQuery({
            type,
            assistant_id,
            customer_phone,
            whatsapp_sender_phone,
            external_identifier,
            per_page,
            cursor,
          })}`
        );
        return textResult(result);
      }

      case 'get_conversation': {
        const { uuid } = args as { uuid: string };
        const result = await client.get(`/api/conversations/${uuid}`);
        return textResult(result);
      }

      case 'create_conversation': {
        const { assistant_id, type, variables } = args as {
          assistant_id: string;
          type?: 'widget' | 'test';
          variables?: Record<string, unknown>;
        };
        const body = pickDefined({ assistant_id, type, variables });
        const result = await client.post('/api/conversations', body);
        return textResult(result);
      }

      case 'send_message': {
        const { uuid, message } = args as { uuid: string; message: string };
        const result = await client.post(`/api/conversations/${uuid}/messages`, {
          message,
        });
        return textResult(result);
      }

      case 'enable_conversation_ai': {
        const { uuid } = args as { uuid: string };
        const result = await client.post(
          `/api/automate/conversations/${uuid}/enable-ai`
        );
        return textResult(result);
      }

      case 'disable_conversation_ai': {
        const { uuid } = args as { uuid: string };
        const result = await client.post(
          `/api/automate/conversations/${uuid}/disable-ai`
        );
        return textResult(result);
      }

      default:
        throw new Error(`Unknown conversation tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

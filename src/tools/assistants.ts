/**
 * Assistant tools — full CRUD plus lookup endpoints (voices, languages, models,
 * providers) and webhook toggle helpers.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, pickDefined, buildQuery } from './_util.js';

export async function handleAssistantTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'get_assistants': {
        const { page, per_page } = args as { page?: number; per_page?: number };
        const result = await client.get(
          `/api/user/assistants/get${buildQuery({ page, per_page })}`
        );
        return textResult(result);
      }

      case 'get_outbound_assistants': {
        const result = await client.get('/api/user/assistants/outbound');
        return textResult(result);
      }

      case 'get_phone_numbers': {
        const { type } = args as { type?: 'inbound' | 'outbound' };
        const result = await client.get(
          `/api/user/assistants/phone-numbers${buildQuery({ type })}`
        );
        return textResult(result);
      }

      case 'get_models': {
        const { type } = args as { type?: 'llm' | 'multimodal' | 'dualplex' };
        const result = await client.get(
          `/api/user/assistants/models${buildQuery({ type })}`
        );
        return textResult(result);
      }

      case 'get_voices': {
        const { mode, language_id } = args as {
          mode?: 'pipeline' | 'multimodal' | 'dualplex';
          language_id?: number;
        };
        const result = await client.get(
          `/api/user/assistants/voices${buildQuery({ mode, language_id })}`
        );
        return textResult(result);
      }

      case 'get_languages': {
        const result = await client.get('/api/user/assistants/languages');
        return textResult(result);
      }

      case 'get_synthesizer_providers': {
        const result = await client.get('/api/user/assistants/synthesizer-providers');
        return textResult(result);
      }

      case 'get_transcriber_providers': {
        const result = await client.get('/api/user/assistants/transcriber-providers');
        return textResult(result);
      }

      case 'create_assistant': {
        const body = pickDefined(args as Record<string, unknown>);
        const result = await client.post('/api/user/assistant', body);
        return textResult(result);
      }

      case 'update_assistant': {
        const { id, ...rest } = args as Record<string, unknown> & { id: number };
        const body = pickDefined(rest);
        const result = await client.request(`/api/user/assistant/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return textResult(result);
      }

      case 'delete_assistant': {
        const { id } = args as { id: number };
        const result = await client.delete(`/api/user/assistant/${id}`);
        return textResult(result);
      }

      case 'enable_assistant_inbound_webhook': {
        const { assistant_id, webhook_url } = args as {
          assistant_id: number;
          webhook_url: string;
        };
        const result = await client.post('/api/user/assistants/enable-inbound-webhook', {
          assistant_id,
          webhook_url,
        });
        return textResult(result);
      }

      case 'disable_assistant_inbound_webhook': {
        const { assistant_id } = args as { assistant_id: number };
        const result = await client.post('/api/user/assistants/disable-inbound-webhook', {
          assistant_id,
        });
        return textResult(result);
      }

      case 'enable_assistant_conversation_ended_webhook': {
        const { assistant_id, webhook_url } = args as {
          assistant_id: number;
          webhook_url: string;
        };
        const result = await client.post(
          '/api/user/assistants/enable-conversation-ended-webhook',
          { assistant_id, webhook_url }
        );
        return textResult(result);
      }

      case 'disable_assistant_conversation_ended_webhook': {
        const { assistant_id } = args as { assistant_id: number };
        const result = await client.post(
          '/api/user/assistants/disable-conversation-ended-webhook',
          { assistant_id }
        );
        return textResult(result);
      }

      case 'disable_assistant_webhook': {
        const { assistant_id } = args as { assistant_id: number };
        const result = await client.post('/api/user/assistants/disable-webhook', {
          assistant_id,
        });
        return textResult(result);
      }

      default:
        throw new Error(`Unknown assistant tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

/**
 * WhatsApp tools — list senders/templates, send template or freeform messages,
 * check session status.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, buildQuery, pickDefined } from './_util.js';

export async function handleWhatsappTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'get_whatsapp_senders': {
        const { status } = args as { status?: string };
        const result = await client.get(
          `/api/user/whatsapp/senders${buildQuery({ status })}`
        );
        return textResult(result);
      }

      case 'get_whatsapp_templates': {
        const { sender_id, status } = args as { sender_id: number; status?: string };
        const result = await client.get(
          `/api/user/whatsapp/senders/${sender_id}/templates${buildQuery({ status })}`
        );
        return textResult(result);
      }

      case 'get_whatsapp_session_status': {
        const { sender_id, recipient_phone } = args as {
          sender_id: number;
          recipient_phone: string;
        };
        const result = await client.get(
          `/api/user/whatsapp/session-status${buildQuery({ sender_id, recipient_phone })}`
        );
        return textResult(result);
      }

      case 'send_whatsapp_template': {
        const body = pickDefined(args as Record<string, unknown>);
        const result = await client.post('/api/user/whatsapp/send', body);
        return textResult(result);
      }

      case 'send_whatsapp_freeform': {
        const body = pickDefined(args as Record<string, unknown>);
        const result = await client.post('/api/user/whatsapp/send-freeform', body);
        return textResult(result);
      }

      default:
        throw new Error(`Unknown WhatsApp tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

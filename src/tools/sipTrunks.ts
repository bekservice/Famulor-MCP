/**
 * SIP trunk tools — provision and manage SIP trunks attached to your account.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, pickDefined } from './_util.js';

export async function handleSipTrunkTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_sip_trunks': {
        const result = await client.get('/api/user/phone-numbers/sip-trunks');
        return textResult(result);
      }

      case 'get_sip_trunk': {
        const { id } = args as { id: number };
        const result = await client.get(`/api/user/phone-numbers/sip-trunks/${id}`);
        return textResult(result);
      }

      case 'create_sip_trunk': {
        const body = pickDefined(args as Record<string, unknown>);
        const result = await client.post('/api/user/phone-numbers/sip-trunks', body);
        return textResult(result);
      }

      case 'update_sip_trunk': {
        const { id, ...rest } = args as Record<string, unknown> & { id: number };
        const body = pickDefined(rest);
        const result = await client.request(
          `/api/user/phone-numbers/sip-trunks/${id}`,
          { method: 'PUT', body: JSON.stringify(body) }
        );
        return textResult(result);
      }

      case 'delete_sip_trunk': {
        const { id } = args as { id: number };
        const result = await client.delete(`/api/user/phone-numbers/${id}`);
        return textResult(result);
      }

      default:
        throw new Error(`Unknown SIP trunk tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

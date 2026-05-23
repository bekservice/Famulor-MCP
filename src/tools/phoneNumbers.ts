/**
 * Phone-number tools — list, search, purchase, release.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, buildQuery } from './_util.js';

export async function handlePhoneNumberTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_all_phone_numbers': {
        const result = await client.get('/api/user/phone-numbers/all');
        return textResult(result);
      }

      case 'search_phone_numbers': {
        const { country_code, contains } = args as {
          country_code?: string;
          contains?: string;
        };
        const result = await client.get(
          `/api/user/phone-numbers/search${buildQuery({ country_code, contains })}`
        );
        return textResult(result);
      }

      case 'purchase_phone_number': {
        const { phone_number } = args as { phone_number: string };
        const result = await client.post('/api/user/phone-numbers/purchase', {
          phone_number,
        });
        return textResult(result);
      }

      case 'release_phone_number': {
        const { id } = args as { id: number };
        const result = await client.delete(`/api/user/phone-numbers/${id}`);
        return textResult(result);
      }

      default:
        throw new Error(`Unknown phone-number tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

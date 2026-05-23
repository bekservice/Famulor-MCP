/**
 * Knowledgebase tools — manage Famulor knowledge bases and their documents.
 */

import { FamulorClient } from '../auth/famulor.js';
import { textResult, errorResult, pickDefined } from './_util.js';

export async function handleKnowledgebaseTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'list_knowledgebases': {
        const result = await client.get('/api/user/knowledgebases');
        return textResult(result);
      }

      case 'get_knowledgebase': {
        const { id } = args as { id: number };
        const result = await client.get(`/api/user/knowledgebases/${id}`);
        return textResult(result);
      }

      case 'create_knowledgebase': {
        const { name: kbName, description } = args as {
          name: string;
          description?: string;
        };
        const body = pickDefined({ name: kbName, description });
        const result = await client.post('/api/user/knowledgebases', body);
        return textResult(result);
      }

      case 'update_knowledgebase': {
        const { id, name: kbName, description } = args as {
          id: number;
          name?: string;
          description?: string;
        };
        const body = pickDefined({ name: kbName, description });
        const result = await client.request(`/api/user/knowledgebases/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });
        return textResult(result);
      }

      case 'delete_knowledgebase': {
        const { id } = args as { id: number };
        const result = await client.delete(`/api/user/knowledgebases/${id}`);
        return textResult(result);
      }

      case 'list_documents': {
        const { knowledgebase_id } = args as { knowledgebase_id: number };
        const result = await client.get(
          `/api/user/knowledgebases/${knowledgebase_id}/documents`
        );
        return textResult(result);
      }

      case 'get_document': {
        const { knowledgebase_id, document_id } = args as {
          knowledgebase_id: number;
          document_id: number;
        };
        const result = await client.get(
          `/api/user/knowledgebases/${knowledgebase_id}/documents/${document_id}`
        );
        return textResult(result);
      }

      case 'create_document': {
        const {
          knowledgebase_id,
          name: docName,
          description,
          type,
          url,
          links,
          relative_links_limit,
        } = args as {
          knowledgebase_id: number;
          name: string;
          description?: string;
          type: 'website' | 'pdf' | 'txt' | 'docx';
          url?: string;
          links?: Array<{ link: string }>;
          relative_links_limit?: number;
        };
        if (type !== 'website') {
          throw new Error(
            'create_document via MCP only supports type="website". For file uploads (pdf/txt/docx) use the Famulor dashboard or call the API directly with multipart/form-data.'
          );
        }
        const body = pickDefined({
          name: docName,
          description,
          type,
          url,
          links,
          relative_links_limit,
        });
        const result = await client.post(
          `/api/user/knowledgebases/${knowledgebase_id}/documents`,
          body
        );
        return textResult(result);
      }

      case 'update_document': {
        const { knowledgebase_id, document_id, name: docName, description } = args as {
          knowledgebase_id: number;
          document_id: number;
          name?: string;
          description?: string;
        };
        const body = pickDefined({ name: docName, description });
        const result = await client.request(
          `/api/user/knowledgebases/${knowledgebase_id}/documents/${document_id}`,
          { method: 'PUT', body: JSON.stringify(body) }
        );
        return textResult(result);
      }

      case 'delete_document': {
        const { knowledgebase_id, document_id } = args as {
          knowledgebase_id: number;
          document_id: number;
        };
        const result = await client.delete(
          `/api/user/knowledgebases/${knowledgebase_id}/documents/${document_id}`
        );
        return textResult(result);
      }

      default:
        throw new Error(`Unknown knowledgebase tool: ${name}`);
    }
  } catch (error) {
    return errorResult(error);
  }
}

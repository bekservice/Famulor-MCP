/**
 * Tool router — dispatches incoming tool calls to the right handler.
 *
 * The Famulor API key for the current request is read from the MCP server's
 * userConfig, which is populated per-request from the OAuth bearer token
 * (see api/index.ts).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { CallToolRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { FamulorClient } from '../auth/famulor.js';
import { handleCallTools } from './calls.js';
import { handleAssistantTools } from './assistants.js';
import { handleConversationTools } from './conversations.js';
import { handleCampaignTools } from './campaigns.js';
import { handleLeadTools } from './leads.js';
import { handleMidCallToolTools } from './midCallTools.js';
import { handleSmsTools } from './sms.js';
import { handleKnowledgebaseTools } from './knowledgebases.js';
import { handlePhoneNumberTools } from './phoneNumbers.js';
import { handleSipTrunkTools } from './sipTrunks.js';
import { handleWhatsappTools } from './whatsapp.js';
import { handleAiReplyTools } from './aiReplies.js';
import { handleUserTools } from './user.js';
import { handleFolderTools } from './folders.js';
import { handleLabelTools } from './labels.js';

const TOOL_GROUPS: Record<string, (name: string, args: unknown, client: FamulorClient) => Promise<unknown>> = {};

const register = (
  names: string[],
  handler: (name: string, args: unknown, client: FamulorClient) => Promise<unknown>
) => {
  for (const n of names) TOOL_GROUPS[n] = handler;
};

register(['make_call', 'get_call', 'list_calls', 'delete_call'], handleCallTools);

register(
  [
    'get_assistants',
    'get_outbound_assistants',
    'get_phone_numbers',
    'get_models',
    'get_voices',
    'get_languages',
    'get_synthesizer_providers',
    'get_transcriber_providers',
    'create_assistant',
    'update_assistant',
    'delete_assistant',
    'enable_assistant_inbound_webhook',
    'disable_assistant_inbound_webhook',
    'enable_assistant_conversation_ended_webhook',
    'disable_assistant_conversation_ended_webhook',
    'disable_assistant_webhook',
  ],
  handleAssistantTools
);

register(
  [
    'list_conversations',
    'get_conversation',
    'create_conversation',
    'send_message',
    'enable_conversation_ai',
    'disable_conversation_ai',
  ],
  handleConversationTools
);

register(
  ['list_campaigns', 'create_campaign', 'update_campaign_status', 'delete_campaign'],
  handleCampaignTools
);

register(['list_leads', 'create_lead', 'update_lead', 'delete_lead'], handleLeadTools);

register(
  [
    'list_mid_call_tools',
    'get_mid_call_tool',
    'create_mid_call_tool',
    'update_mid_call_tool',
    'delete_mid_call_tool',
  ],
  handleMidCallToolTools
);

register(['send_sms'], handleSmsTools);

register(
  [
    'list_knowledgebases',
    'get_knowledgebase',
    'create_knowledgebase',
    'update_knowledgebase',
    'delete_knowledgebase',
    'list_documents',
    'get_document',
    'create_document',
    'update_document',
    'delete_document',
  ],
  handleKnowledgebaseTools
);

register(
  [
    'list_all_phone_numbers',
    'search_phone_numbers',
    'purchase_phone_number',
    'update_phone_number',
    'release_phone_number',
  ],
  handlePhoneNumberTools
);

register(['list_folders', 'create_folder', 'update_folder', 'delete_folder'], handleFolderTools);

register(['list_labels', 'create_label', 'update_label', 'delete_label'], handleLabelTools);

register(
  [
    'list_sip_trunks',
    'get_sip_trunk',
    'create_sip_trunk',
    'update_sip_trunk',
    'delete_sip_trunk',
  ],
  handleSipTrunkTools
);

register(
  [
    'get_whatsapp_senders',
    'get_whatsapp_templates',
    'get_whatsapp_session_status',
    'send_whatsapp_template',
    'send_whatsapp_freeform',
  ],
  handleWhatsappTools
);

register(['generate_ai_reply'], handleAiReplyTools);

register(['get_me'], handleUserTools);

function getClientFromConfig(server: Server): FamulorClient {
  const userConfig = (server as any).userConfig || {};
  let apiKey = userConfig.famulor_api_key;

  if (!apiKey) {
    const config = (server as any).config || {};
    apiKey = config.famulor_api_key;
  }

  if (!apiKey) {
    apiKey = process.env.FAMULOR_API_KEY;
  }

  if (!apiKey) {
    throw new Error(
      'Authentication not configured. Get an API key at https://app.famulor.de/api-keys and connect this MCP server via OAuth.'
    );
  }

  return new FamulorClient(apiKey);
}

export async function registerAllTools(server: Server): Promise<void> {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    const handler = TOOL_GROUPS[name];
    if (!handler) {
      throw new Error(`Unknown tool: ${name}`);
    }
    const client = getClientFromConfig(server);
    return handler(name, args, client) as Promise<{ content: Array<{ type: 'text'; text: string }>; isError?: boolean }>;
  });
}

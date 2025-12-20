/**
 * Tool Registration
 *
 * Registers all Famulor tools with the MCP server
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

/**
 * Get Famulor client from user's stored API key
 *
 * Tries multiple sources in order:
 * 1. MCP userConfig (set by user via Config API in ChatGPT/Claude UI)
 * 2. MCP config (legacy, for backward compatibility)
 * 3. Environment variable (for development/testing only)
 *
 * IMPORTANT: In production (OpenAI App Store), users will enter their API key
 * through the ChatGPT/Claude UI, which will be stored in userConfig.
 */
function getClientFromConfig(server: Server): FamulorClient {
  // Try userConfig first (set via Config API by user in UI)
  const userConfig = (server as any).userConfig || {};
  let apiKey = userConfig.famulor_api_key;

  // Fallback to legacy config
  if (!apiKey) {
    const config = (server as any).config || {};
    apiKey = config.famulor_api_key;
  }

  // Fallback to environment variable (development/testing only)
  // This should NOT be used in production
  if (!apiKey) {
    apiKey = process.env.FAMULOR_API_KEY;
  }

  if (!apiKey) {
    throw new Error(
      'Famulor API key not configured.\n\n' +
      'Please configure your API key in the app settings.\n' +
      'You can get your API key here: https://app.famulor.de/api-keys\n\n' +
      'In ChatGPT/Claude: Go to app settings and enter your Famulor API key.'
    );
  }

  return new FamulorClient(apiKey);
}

/**
 * Register all tools with a single unified handler
 * The client is created per-request using the user's API key from config
 */
export async function registerAllTools(server: Server): Promise<void> {
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    // Get client with user's API key for this request
    const client = getClientFromConfig(server);

    // Route to appropriate tool handler
    if (['make_call', 'get_call', 'list_calls'].includes(name)) {
      return handleCallTools(name, args, client);
    }

    if (
      [
        'get_assistants',
        'get_phone_numbers',
        'get_models',
        'get_voices',
        'get_languages',
        'update_assistant',
      ].includes(name)
    ) {
      return handleAssistantTools(name, args, client);
    }

    if (
      ['get_conversation', 'create_conversation', 'send_message'].includes(name)
    ) {
      return handleConversationTools(name, args, client);
    }

    if (['list_campaigns', 'update_campaign_status'].includes(name)) {
      return handleCampaignTools(name, args, client);
    }

    if (['list_leads', 'create_lead', 'update_lead'].includes(name)) {
      return handleLeadTools(name, args, client);
    }

    if (
      ['list_mid_call_tools', 'get_mid_call_tool', 'update_mid_call_tool'].includes(
        name
      )
    ) {
      return handleMidCallToolTools(name, args, client);
    }

    if (['send_sms'].includes(name)) {
      return handleSmsTools(name, args, client);
    }

    throw new Error(`Unknown tool: ${name}`);
  });
}


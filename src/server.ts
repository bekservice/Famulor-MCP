/**
 * MCP Server Setup for Famulor Tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { registerAllTools } from './tools/index.js';

/**
 * Setup the Famulor MCP server with all tools and handlers
 *
 * NOTE: Each user must configure their own Famulor API key.
 * The API key is provided by the user via the MCP Config API,
 * which allows users to enter their API key through the ChatGPT/Claude UI.
 *
 * This ensures:
 * - Each user uses their own Famulor API key
 * - API keys are securely stored per-user
 * - The app can be deployed online for the OpenAI App Store
 */
export async function setupFamulorServer(server: Server): Promise<void> {
  // Initialize user config storage
  // This will be populated when users set their API key via the Config API
  if (!(server as any).userConfig) {
    (server as any).userConfig = {};
  }

  // Note: User configuration (API keys) will be handled by the OpenAI Apps SDK
  // When deployed online, users will enter their API key through the ChatGPT/Claude UI
  // The API key will be passed to the server via the MCP protocol in each request
  //
  // For local development, users can set it via:
  // 1. MCP config file (mcp.json) with env variable
  // 2. Environment variable FAMULOR_API_KEY
  //
  // For production (OpenAI App Store):
  // - Users enter API key in ChatGPT/Claude UI
  // - OpenAI Apps SDK passes it to the server per-request
  // - Server uses it to authenticate with Famulor API

  // Register all tools with a single handler
  // The client will be created per-request using the user's API key
  await registerAllTools(server);

  // List tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        // Call tools
        {
          name: 'make_call',
          description: 'Make an AI-powered phone call with a Famulor AI assistant',
          inputSchema: {
            type: 'object',
            properties: {
              assistant_id: {
                type: 'string',
                description: 'The ID of the AI assistant that should make the call',
              },
              phone_number: {
                type: 'string',
                description: 'The phone number to call (E.164 format)',
              },
              variables: {
                type: 'object',
                description: 'Optional variables for personalizing the conversation',
                additionalProperties: true,
              },
            },
            required: ['assistant_id', 'phone_number'],
          },
        },
        {
          name: 'get_call',
          description: 'Get details of a specific call by call ID',
          inputSchema: {
            type: 'object',
            properties: {
              call_id: {
                type: 'string',
                description: 'The unique ID of the call',
              },
            },
            required: ['call_id'],
          },
        },
        {
          name: 'list_calls',
          description: 'List all calls with optional filter options',
          inputSchema: {
            type: 'object',
            properties: {
              assistant_id: {
                type: 'string',
                description: 'Filter by assistant ID',
              },
              limit: {
                type: 'number',
                description: 'Maximum number of calls to return',
                default: 50,
              },
            },
          },
        },
        // Assistant tools
        {
          name: 'get_assistants',
          description: 'Get all available AI assistants from the Famulor account',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_assistant_details',
          description: 'Get detailed information about a specific assistant',
          inputSchema: {
            type: 'object',
            properties: {
              assistant_id: {
                type: 'string',
                description: 'The ID of the assistant',
              },
            },
            required: ['assistant_id'],
          },
        },
      ],
    };
  });
}


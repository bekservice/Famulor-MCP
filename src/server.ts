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

  // Note: User configuration (API keys) is handled by the OpenAI Apps SDK
  // When users connect via the App Store, the Apps SDK passes the API key
  // in the request context. We access it via server.userConfig or server.config
  // which is populated by the Apps SDK automatically.

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
          description: 'List all calls with optional filter options (paginated)',
          inputSchema: {
            type: 'object',
            properties: {
              assistant_id: {
                type: 'string',
                description: 'Filter by assistant ID',
              },
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              per_page: {
                type: 'number',
                description: 'Number of calls per page (default: 15)',
              },
            },
          },
        },
        // Assistant tools
        {
          name: 'get_assistants',
          description:
            'Get all available AI assistants from the Famulor account (paginated). Returns assistant configuration including variables that can be used when creating leads. Variable names are fixed in the assistant configuration and must be used exactly as defined when creating leads.',
          inputSchema: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              per_page: {
                type: 'number',
                description: 'Number of assistants per page (default: 10)',
              },
            },
          },
        },
        {
          name: 'get_phone_numbers',
          description:
            'Get all available phone numbers for assistant assignment',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['inbound', 'outbound'],
                description:
                  'Filter phone numbers by assistant type. Options: inbound, outbound',
              },
            },
          },
        },
        {
          name: 'get_models',
          description:
            'Get all available LLM models for assistant configuration',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_voices',
          description:
            'Get all available voices for assistant configuration',
          inputSchema: {
            type: 'object',
            properties: {
              mode: {
                type: 'string',
                enum: ['pipeline', 'multimodal'],
                description:
                  'Filter voices by assistant mode. Options: pipeline, multimodal',
              },
            },
          },
        },
        {
          name: 'get_languages',
          description:
            'Get all available languages for assistant configuration',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'update_assistant',
          description: 'Update the configuration of an existing AI assistant',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'The unique identifier of the assistant to update',
              },
              assistant_name: {
                type: 'string',
                description: 'The name of the assistant (max. 255 characters)',
              },
              voice_id: {
                type: 'number',
                description:
                  'The voice ID for the assistant (must exist in available voices)',
              },
              language: {
                type: 'string',
                description: 'The language name for the assistant (max. 100 characters)',
              },
              llm_model: {
                type: 'string',
                description: 'The name of the LLM model to use (max. 100 characters)',
              },
              calls_direction: {
                type: 'string',
                enum: ['receive', 'make'],
                description: 'The call direction type. Options: receive, make',
              },
              engine_type: {
                type: 'string',
                enum: ['pipeline', 'multimodal'],
                description: 'The engine type to use. Options: pipeline, multimodal',
              },
              timezone: {
                type: 'string',
                description: 'The timezone for the assistant (e.g., "Europe/Berlin")',
              },
              initial_message: {
                type: 'string',
                description:
                  'The first message the assistant will speak at call start',
              },
              system_prompt: {
                type: 'string',
                description:
                  'The system prompt that defines the assistant behavior and personality',
              },
              phone_number_id: {
                type: ['number', 'null'],
                description:
                  'The ID of a phone number to assign to the assistant (set to null to remove)',
              },
              tool_ids: {
                type: 'array',
                items: { type: 'number' },
                description:
                  'Array of mid-call action IDs to sync with the assistant. Replaces all existing tool assignments. Pass an empty array to remove all tools.',
              },
              endpoint_type: {
                type: 'string',
                enum: ['vad', 'ai'],
                description: 'Voice activity detection type. Options: vad, ai',
              },
              endpoint_sensitivity: {
                type: 'number',
                description: 'Endpoint sensitivity level (0-5)',
              },
              interrupt_sensitivity: {
                type: 'number',
                description: 'Interruption sensitivity level (0-5)',
              },
              ambient_sound_volume: {
                type: 'number',
                description: 'Ambient sound volume (0-1)',
              },
              post_call_evaluation: {
                type: 'boolean',
                description: 'Whether to enable post-call evaluation',
              },
              send_webhook_only_on_completed: {
                type: 'boolean',
                description:
                  'Whether to send webhooks only on completed calls',
              },
              include_recording_in_webhook: {
                type: 'boolean',
                description:
                  'Whether to include recording URL in webhook payload',
              },
              is_webhook_active: {
                type: 'boolean',
                description: 'Whether webhook notifications are enabled',
              },
              webhook_url: {
                type: ['string', 'null'],
                description:
                  'The webhook URL for post-call notifications (can be set to null to remove)',
              },
              use_min_interrupt_words: {
                type: 'boolean',
                description:
                  'Whether to use the minimum interrupt words setting',
              },
              min_interrupt_words: {
                type: 'number',
                description:
                  'Minimum number of words before allowed interruption (0-10)',
              },
              variables: {
                type: 'object',
                description:
                  'Key-value pairs of custom variables for the assistant',
              },
              post_call_schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description:
                        'The name of the schema field (alphanumeric and underscores only)',
                    },
                    type: {
                      type: 'string',
                      enum: ['string', 'number', 'bool'],
                      description: 'The data type. Options: string, number, bool',
                    },
                    description: {
                      type: 'string',
                      description: 'Description of what this field represents',
                    },
                  },
                  required: ['name', 'type', 'description'],
                },
                description: 'Schema definition for post-call data extraction',
              },
              end_call_tool: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description:
                      'Description for the end call tool functionality (max. 500 characters)',
                  },
                },
                description: 'End call tool configuration',
              },
              llm_temperature: {
                type: 'number',
                description: 'LLM temperature setting (0-1)',
              },
              voice_stability: {
                type: 'number',
                description: 'Voice stability setting (0-1)',
              },
              voice_similarity: {
                type: 'number',
                description: 'Voice similarity setting (0-1)',
              },
              speech_speed: {
                type: 'number',
                description: 'Speech speed multiplier (0.7-1.2)',
              },
              allow_interruptions: {
                type: 'boolean',
                description:
                  'Whether interruptions by the caller are allowed',
              },
              filler_audios: {
                type: 'boolean',
                description:
                  'Whether to use filler audio during processing',
              },
              re_engagement_interval: {
                type: 'number',
                description: 'Re-engagement interval in seconds (7-600)',
              },
              max_call_duration: {
                type: 'number',
                description: 'Maximum call duration in seconds (20-1200)',
              },
              max_silence_duration: {
                type: 'number',
                description: 'Maximum silence duration in seconds (1-120)',
              },
              end_call_on_voicemail: {
                type: 'boolean',
                description: 'Whether to end call on voicemail detection',
              },
              noise_cancellation: {
                type: 'boolean',
                description: 'Whether noise cancellation is enabled',
              },
              record_call: {
                type: 'boolean',
                description: 'Whether the call should be recorded',
              },
              who_speaks_first: {
                type: 'string',
                enum: ['AI assistant', 'Customer'],
                description: 'Who speaks first in the call. Options: AI assistant, Customer',
              },
            },
            required: ['id'],
          },
        },
        // Conversation tools
        {
          name: 'get_conversation',
          description: 'Get the complete message history of an existing Famulor conversation by UUID',
          inputSchema: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                description: 'The UUID of the conversation to retrieve',
              },
            },
            required: ['uuid'],
          },
        },
        {
          name: 'create_conversation',
          description:
            'Start a new chat session with an AI assistant. Creates a widget or test conversation and returns the initial history.',
          inputSchema: {
            type: 'object',
            properties: {
              assistant_id: {
                type: 'string',
                description: 'UUID of the assistant that will handle the conversation',
              },
              type: {
                type: 'string',
                enum: ['widget', 'test'],
                description:
                  'Conversation type. Options: widget (paid) or test (free for development)',
              },
              variables: {
                type: 'object',
                description:
                  'Custom variables to inject into the assistant context (accessible via {{variable_name}})',
              },
            },
            required: ['assistant_id'],
          },
        },
        {
          name: 'send_message',
          description:
            'Send a user message to an existing conversation and receive the assistant response',
          inputSchema: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                description: 'UUID of the existing conversation',
              },
              message: {
                type: 'string',
                description: 'User message to send (max. 2000 characters)',
              },
            },
            required: ['uuid', 'message'],
          },
        },
        // Campaign tools
        {
          name: 'list_campaigns',
          description: 'List all campaigns from the Famulor account',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'update_campaign_status',
          description: 'Start or stop a campaign in the Famulor system',
          inputSchema: {
            type: 'object',
            properties: {
              campaign_id: {
                type: 'number',
                description: 'The ID of the campaign to update',
              },
              action: {
                type: 'string',
                enum: ['start', 'stop'],
                description: 'The action to perform on the campaign: start or stop',
              },
            },
            required: ['campaign_id', 'action'],
          },
        },
        // Lead tools
        {
          name: 'list_leads',
          description: 'List all leads for the authenticated user (paginated)',
          inputSchema: {
            type: 'object',
            properties: {
              page: {
                type: 'number',
                description: 'Page number (default: 1)',
              },
              per_page: {
                type: 'number',
                description: 'Number of leads per page (default: 15)',
              },
            },
          },
        },
        {
          name: 'create_lead',
          description: 'Create a new lead in the Famulor system',
          inputSchema: {
            type: 'object',
            properties: {
              phone_number: {
                type: 'string',
                description: 'The phone number of the lead in E.164 format (e.g., +1234567890)',
              },
              campaign_id: {
                type: 'number',
                description: 'The ID of the campaign for which the lead should be created',
              },
              variables: {
                type: 'array',
                description:
                  'Array of variable objects to be passed to the lead. IMPORTANT: Variable names come from the assistant associated with the campaign and are FIXED. You can only add values for these variables, but the variable names cannot be changed. To see available variables, use get_assistants to retrieve the assistant configuration. If you need to change variable names, you must update the assistant (but this is dangerous as it may affect existing leads and calls).',
                items: {
                  type: 'object',
                  additionalProperties: true,
                  description:
                    'Variable object with keys matching the assistant variable names. The variable names are fixed in the assistant configuration and cannot be modified here.',
                },
              },
              allow_dupplicate: {
                type: 'boolean',
                description: 'Whether duplicate leads are allowed in a campaign',
              },
            },
            required: ['phone_number', 'campaign_id'],
          },
        },
        {
          name: 'update_lead',
          description: 'Update an existing lead in your campaigns',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'The ID of the lead to update',
              },
              campaign_id: {
                type: 'number',
                description: 'The ID of the campaign to assign the lead to',
              },
              phone_number: {
                type: 'string',
                description: 'The phone number of the lead (automatically formatted to E.164 format)',
              },
              status: {
                type: 'string',
                enum: ['created', 'completed', 'reached-max-retries'],
                description: 'The status of the lead',
              },
              variables: {
                type: 'object',
                description:
                  'Custom variables to be merged with existing lead variables. IMPORTANT: Variable names come from the assistant associated with the campaign and are FIXED. You can only update values for these variables, but the variable names cannot be changed. To see available variables, use get_assistants to retrieve the assistant configuration. If you need to change variable names, you must update the assistant (but this is dangerous as it may affect existing leads and calls).',
                additionalProperties: true,
              },
            },
            required: ['id'],
          },
        },
        // SMS Tools
        {
          name: 'send_sms',
          description:
            'Send an SMS message via your phone number. The SMS is sent via Twilio and costs are automatically deducted from your account balance.',
          inputSchema: {
            type: 'object',
            properties: {
              from: {
                type: 'number',
                description:
                  'The ID of your phone number from which the SMS should be sent (must be SMS-capable)',
              },
              to: {
                type: 'string',
                description:
                  'The recipient phone number in international format (e.g., "+4915123456789")',
              },
              body: {
                type: 'string',
                description: 'The SMS message content (max. 300 characters)',
              },
            },
            required: ['from', 'to', 'body'],
          },
        },
        // Mid-Call Tools
        {
          name: 'list_mid_call_tools',
          description: 'List all mid-call tools that allow AI assistants to interact with external APIs during calls',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_mid_call_tool',
          description: 'Get detailed information about a specific mid-call tool by ID',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'The unique ID of the mid-call tool',
              },
            },
            required: ['id'],
          },
        },
        {
          name: 'update_mid_call_tool',
          description: 'Update an existing mid-call tool',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'The unique ID of the tool to update',
              },
              name: {
                type: 'string',
                description: 'Tool name (lowercase letters and underscores only, must start with a letter)',
              },
              description: {
                type: 'string',
                description: 'Detailed explanation of when and how the AI should use this tool (max 255 characters)',
              },
              endpoint: {
                type: 'string',
                description: 'Valid URL of the API endpoint to call',
              },
              method: {
                type: 'string',
                enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
                description: 'HTTP method',
              },
              timeout: {
                type: 'number',
                description: 'Request timeout in seconds (1-30)',
              },
              headers: {
                type: 'array',
                description: 'HTTP headers to send with the request (replaces existing headers)',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                    },
                    value: {
                      type: 'string',
                    },
                  },
                  required: ['name', 'value'],
                },
              },
              schema: {
                type: 'array',
                description: 'Parameter schema (replaces existing schema)',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description: 'Parameter name (2-32 characters)',
                    },
                    type: {
                      type: 'string',
                      enum: ['string', 'number', 'boolean'],
                      description: 'Parameter type',
                    },
                    description: {
                      type: 'string',
                      description: 'Parameter description (3-255 characters)',
                    },
                  },
                  required: ['name', 'type', 'description'],
                },
              },
            },
            required: ['id'],
          },
        },
      ],
    };
  });
}


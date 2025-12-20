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
          description: 'Get all available AI assistants from the Famulor account (paginated)',
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
            'Alle verfügbaren Telefonnummern für die Assistenten-Zuweisung abrufen',
          inputSchema: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['inbound', 'outbound'],
                description:
                  'Telefonnummern nach Assistenten-Typ filtern. Optionen: inbound, outbound',
              },
            },
          },
        },
        {
          name: 'get_models',
          description:
            'Alle verfügbaren LLM-Modelle für die Assistenten-Konfiguration abrufen',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_voices',
          description:
            'Alle verfügbaren Stimmen für die Assistenten-Konfiguration abrufen',
          inputSchema: {
            type: 'object',
            properties: {
              mode: {
                type: 'string',
                enum: ['pipeline', 'multimodal'],
                description:
                  'Stimmen nach Assistenten-Modus filtern. Optionen: pipeline, multimodal',
              },
            },
          },
        },
        {
          name: 'get_languages',
          description:
            'Alle verfügbaren Sprachen für die Assistenten-Konfiguration abrufen',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'update_assistant',
          description: 'Die Konfiguration eines bestehenden KI-Assistenten aktualisieren',
          inputSchema: {
            type: 'object',
            properties: {
              id: {
                type: 'number',
                description: 'Die eindeutige Kennung des zu aktualisierenden Assistenten',
              },
              assistant_name: {
                type: 'string',
                description: 'Der Name des Assistenten (max. 255 Zeichen)',
              },
              voice_id: {
                type: 'number',
                description:
                  'Die Stimmen-ID für den Assistenten (muss in verfügbaren Stimmen existieren)',
              },
              language: {
                type: 'string',
                description: 'Der Sprachname für den Assistenten (max. 100 Zeichen)',
              },
              llm_model: {
                type: 'string',
                description: 'Der Name des zu verwendenden LLM-Modells (max. 100 Zeichen)',
              },
              calls_direction: {
                type: 'string',
                enum: ['receive', 'make'],
                description: 'Der Anrufrichtungstyp. Optionen: receive, make',
              },
              engine_type: {
                type: 'string',
                enum: ['pipeline', 'multimodal'],
                description: 'Der zu verwendende Engine-Typ. Optionen: pipeline, multimodal',
              },
              timezone: {
                type: 'string',
                description: 'Die Zeitzone für den Assistenten (z.B. "Europe/Berlin")',
              },
              initial_message: {
                type: 'string',
                description:
                  'Die erste Nachricht, die der Assistent beim Anrufstart sprechen wird',
              },
              system_prompt: {
                type: 'string',
                description:
                  'Der System-Prompt, der das Verhalten und die Persönlichkeit des Assistenten definiert',
              },
              phone_number_id: {
                type: ['number', 'null'],
                description:
                  'Die ID einer Telefonnummer, die dem Assistenten zugewiesen werden soll (auf null setzen zum Entfernen)',
              },
              tool_ids: {
                type: 'array',
                items: { type: 'number' },
                description:
                  'Array von Mid-call Action-IDs zur Synchronisierung mit dem Assistenten. Ersetzt alle bestehenden Tool-Zuweisungen. Übergeben Sie ein leeres Array, um alle Tools zu entfernen.',
              },
              endpoint_type: {
                type: 'string',
                enum: ['vad', 'ai'],
                description: 'Sprachaktivitätserkennung-Typ. Optionen: vad, ai',
              },
              endpoint_sensitivity: {
                type: 'number',
                description: 'Endpunkt-Sensibilitätslevel (0-5)',
              },
              interrupt_sensitivity: {
                type: 'number',
                description: 'Unterbrechungs-Sensibilitätslevel (0-5)',
              },
              ambient_sound_volume: {
                type: 'number',
                description: 'Ambiente-Sound-Lautstärke (0-1)',
              },
              post_call_evaluation: {
                type: 'boolean',
                description: 'Ob Post-Call-Evaluation aktiviert werden soll',
              },
              send_webhook_only_on_completed: {
                type: 'boolean',
                description:
                  'Ob Webhooks nur bei abgeschlossenen Anrufen gesendet werden sollen',
              },
              include_recording_in_webhook: {
                type: 'boolean',
                description:
                  'Ob Aufzeichnungs-URL in Webhook-Payload eingeschlossen werden soll',
              },
              is_webhook_active: {
                type: 'boolean',
                description: 'Ob Webhook-Benachrichtigungen aktiviert sind',
              },
              webhook_url: {
                type: ['string', 'null'],
                description:
                  'Die Webhook-URL für Post-Call-Benachrichtigungen (kann auf null gesetzt werden zum Entfernen)',
              },
              use_min_interrupt_words: {
                type: 'boolean',
                description:
                  'Ob die Mindest-Unterbrechungswörter-Einstellung verwendet werden soll',
              },
              min_interrupt_words: {
                type: 'number',
                description:
                  'Mindestanzahl von Wörtern vor erlaubter Unterbrechung (0-10)',
              },
              variables: {
                type: 'object',
                description:
                  'Schlüssel-Wert-Paare von benutzerdefinierten Variablen für den Assistenten',
              },
              post_call_schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: {
                      type: 'string',
                      description:
                        'Der Name des Schema-Feldes (nur alphanumerisch und Unterstriche)',
                    },
                    type: {
                      type: 'string',
                      enum: ['string', 'number', 'bool'],
                      description: 'Der Datentyp. Optionen: string, number, bool',
                    },
                    description: {
                      type: 'string',
                      description: 'Beschreibung dessen, was dieses Feld repräsentiert',
                    },
                  },
                  required: ['name', 'type', 'description'],
                },
                description: 'Schema-Definition für Post-Call-Datenextraktion',
              },
              end_call_tool: {
                type: 'object',
                properties: {
                  description: {
                    type: 'string',
                    description:
                      'Beschreibung für die End Call Tool-Funktionalität (max. 500 Zeichen)',
                  },
                },
                description: 'End Call Tool-Konfiguration',
              },
              llm_temperature: {
                type: 'number',
                description: 'LLM-Temperatur-Einstellung (0-1)',
              },
              voice_stability: {
                type: 'number',
                description: 'Stimm-Stabilität-Einstellung (0-1)',
              },
              voice_similarity: {
                type: 'number',
                description: 'Stimm-Ähnlichkeit-Einstellung (0-1)',
              },
              speech_speed: {
                type: 'number',
                description: 'Sprechgeschwindigkeits-Multiplikator (0.7-1.2)',
              },
              allow_interruptions: {
                type: 'boolean',
                description:
                  'Ob Unterbrechungen durch den Anrufer erlaubt werden sollen',
              },
              filler_audios: {
                type: 'boolean',
                description:
                  'Ob Füller-Audio während der Verarbeitung verwendet werden soll',
              },
              re_engagement_interval: {
                type: 'number',
                description: 'Re-Engagement-Intervall in Sekunden (7-600)',
              },
              max_call_duration: {
                type: 'number',
                description: 'Maximale Anrufdauer in Sekunden (20-1200)',
              },
              max_silence_duration: {
                type: 'number',
                description: 'Maximale Stillstand-Dauer in Sekunden (1-120)',
              },
              end_call_on_voicemail: {
                type: 'boolean',
                description: 'Ob Anruf bei Voicemail-Erkennung beendet werden soll',
              },
              noise_cancellation: {
                type: 'boolean',
                description: 'Ob Geräuschunterdrückung aktiviert werden soll',
              },
              record_call: {
                type: 'boolean',
                description: 'Ob der Anruf aufgezeichnet werden soll',
              },
              who_speaks_first: {
                type: 'string',
                enum: ['AI assistant', 'Customer'],
                description: 'Wer zuerst im Anruf spricht. Optionen: AI assistant, Customer',
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
            'Neue Chat-Session mit einem KI-Assistenten starten. Erstellt eine Widget- oder Test-Conversation und gibt den initialen Verlauf zurück.',
          inputSchema: {
            type: 'object',
            properties: {
              assistant_id: {
                type: 'string',
                description: 'UUID des Assistenten, der die Conversation übernehmen soll',
              },
              type: {
                type: 'string',
                enum: ['widget', 'test'],
                description:
                  'Conversation-Typ. Optionen: widget (kostenpflichtig) oder test (kostenlos für Entwicklung)',
              },
              variables: {
                type: 'object',
                description:
                  'Individuelle Variablen, die in den Assistenten-Kontext injiziert werden (zugreifbar via {{variable_name}})',
              },
            },
            required: ['assistant_id'],
          },
        },
        {
          name: 'send_message',
          description:
            'Eine Nutzernachricht an eine bestehende Conversation senden und die Antwort des Assistenten erhalten',
          inputSchema: {
            type: 'object',
            properties: {
              uuid: {
                type: 'string',
                description: 'UUID der bestehenden Conversation',
              },
              message: {
                type: 'string',
                description: 'Zu sendende Nutzernachricht (max. 2000 Zeichen)',
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
          description: 'List all leads for the authenticated user',
          inputSchema: {
            type: 'object',
            properties: {},
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
                description: 'The variables to be passed to the lead',
                items: {
                  type: 'object',
                  additionalProperties: true,
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
                description: 'Custom variables to be merged with existing lead variables',
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
            'Eine SMS-Nachricht über Ihre Telefonnummer senden. Die SMS wird über Twilio versendet und die Kosten werden automatisch von Ihrem Kontoguthaben abgezogen.',
          inputSchema: {
            type: 'object',
            properties: {
              from: {
                type: 'number',
                description:
                  'Die ID Ihrer Telefonnummer, von der die SMS gesendet werden soll (muss SMS-fähig sein)',
              },
              to: {
                type: 'string',
                description:
                  'Die Telefonnummer des Empfängers im internationalen Format (z.B. "+4915123456789")',
              },
              body: {
                type: 'string',
                description: 'Der SMS-Nachrichteninhalt (max. 300 Zeichen)',
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


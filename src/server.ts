/**
 * MCP Server setup for the Famulor toolkit.
 *
 * The API key for the current request is supplied by the transport layer
 * (Streamable HTTP / OAuth bearer token, see api/index.ts) and lives on
 * `server.userConfig.famulor_api_key`.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { registerAllTools } from './tools/index.js';

const Schema = (
  properties: Record<string, unknown>,
  required: string[] = []
) => ({
  type: 'object',
  properties,
  ...(required.length ? { required } : {}),
});

type ToolAnnotations = {
  title?: string;
  readOnlyHint: boolean;
  destructiveHint: boolean;
  idempotentHint: boolean;
  openWorldHint: boolean;
};

type JsonSchema = Record<string, unknown>;

type ToolDef = {
  name: string;
  description: string;
  inputSchema: ReturnType<typeof Schema>;
  outputSchema?: JsonSchema;
  annotations?: ToolAnnotations;
};

/**
 * Output schemas — Famulor's REST API returns a few recurring shapes. We
 * map each tool to one of these so models can plan around the result without
 * needing to call the tool once just to inspect the structure.
 *
 * All schemas use additionalProperties:true since Famulor occasionally adds
 * new fields (e.g. when they ship new assistant settings) and we don't want
 * to invalidate the schema.
 *
 * Bare arrays returned by Famulor get wrapped under a `result` key by
 * src/tools/_util.ts:textResult so the structuredContent stays a valid
 * JSON object.
 */
const SCHEMA_PAGINATED: JsonSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    current_page: { type: 'number' },
    data: { type: 'array', items: { type: 'object', additionalProperties: true } },
    last_page: { type: 'number' },
    per_page: { type: 'number' },
    total: { type: 'number' },
    from: { type: ['number', 'null'] },
    to: { type: ['number', 'null'] },
    next_page_url: { type: ['string', 'null'] },
    prev_page_url: { type: ['string', 'null'] },
  },
};

const SCHEMA_DATA_WRAPPER: JsonSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    data: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  required: ['data'],
};

const SCHEMA_LIST_WRAPPED: JsonSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    result: { type: 'array', items: { type: 'object', additionalProperties: true } },
  },
  required: ['result'],
};

const SCHEMA_SINGLE: JsonSchema = {
  type: 'object',
  additionalProperties: true,
};

const SCHEMA_ACTION: JsonSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    message: { type: 'string' },
    data: { type: ['object', 'array', 'null'], additionalProperties: true },
  },
};

const SCHEMA_USER: JsonSchema = {
  type: 'object',
  additionalProperties: true,
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    total_balance: { type: 'number' },
  },
};

// Tool name → outputSchema. Anything not listed falls back to SCHEMA_SINGLE.
const OUTPUT_SCHEMAS: Record<string, JsonSchema> = {
  // user
  get_me: SCHEMA_USER,

  // paginated list endpoints (Laravel paginator shape)
  get_assistants: SCHEMA_PAGINATED,
  list_calls: SCHEMA_PAGINATED,
  list_leads: SCHEMA_PAGINATED,
  list_conversations: SCHEMA_PAGINATED,

  // bare arrays (wrapped under `result` by our text helper)
  get_languages: SCHEMA_LIST_WRAPPED,
  get_models: SCHEMA_LIST_WRAPPED,
  get_voices: SCHEMA_LIST_WRAPPED,
  get_phone_numbers: SCHEMA_LIST_WRAPPED,
  get_outbound_assistants: SCHEMA_LIST_WRAPPED,
  get_synthesizer_providers: SCHEMA_LIST_WRAPPED,
  get_transcriber_providers: SCHEMA_LIST_WRAPPED,
  list_campaigns: SCHEMA_LIST_WRAPPED,
  list_mid_call_tools: SCHEMA_LIST_WRAPPED,
  search_phone_numbers: SCHEMA_LIST_WRAPPED,

  // {data:[…]} wrapper shape
  list_knowledgebases: SCHEMA_DATA_WRAPPER,
  list_documents: SCHEMA_DATA_WRAPPER,
  list_sip_trunks: SCHEMA_DATA_WRAPPER,
  list_all_phone_numbers: SCHEMA_DATA_WRAPPER,
  get_whatsapp_senders: SCHEMA_DATA_WRAPPER,
  get_whatsapp_templates: SCHEMA_DATA_WRAPPER,

  // single-resource reads
  get_call: SCHEMA_SINGLE,
  get_conversation: SCHEMA_SINGLE,
  get_knowledgebase: SCHEMA_SINGLE,
  get_document: SCHEMA_SINGLE,
  get_sip_trunk: SCHEMA_SINGLE,
  get_mid_call_tool: SCHEMA_SINGLE,
  get_whatsapp_session_status: SCHEMA_SINGLE,

  // write actions (create / update / delete / send / start / stop)
  make_call: SCHEMA_ACTION,
  create_assistant: SCHEMA_ACTION,
  update_assistant: SCHEMA_ACTION,
  delete_assistant: SCHEMA_ACTION,
  delete_call: SCHEMA_ACTION,
  enable_assistant_inbound_webhook: SCHEMA_ACTION,
  disable_assistant_inbound_webhook: SCHEMA_ACTION,
  enable_assistant_conversation_ended_webhook: SCHEMA_ACTION,
  disable_assistant_conversation_ended_webhook: SCHEMA_ACTION,
  disable_assistant_webhook: SCHEMA_ACTION,
  create_conversation: SCHEMA_ACTION,
  send_message: SCHEMA_ACTION,
  enable_conversation_ai: SCHEMA_ACTION,
  disable_conversation_ai: SCHEMA_ACTION,
  create_campaign: SCHEMA_ACTION,
  update_campaign_status: SCHEMA_ACTION,
  delete_campaign: SCHEMA_ACTION,
  create_lead: SCHEMA_ACTION,
  update_lead: SCHEMA_ACTION,
  delete_lead: SCHEMA_ACTION,
  send_sms: SCHEMA_ACTION,
  create_mid_call_tool: SCHEMA_ACTION,
  update_mid_call_tool: SCHEMA_ACTION,
  delete_mid_call_tool: SCHEMA_ACTION,
  create_knowledgebase: SCHEMA_ACTION,
  update_knowledgebase: SCHEMA_ACTION,
  delete_knowledgebase: SCHEMA_ACTION,
  create_document: SCHEMA_ACTION,
  update_document: SCHEMA_ACTION,
  delete_document: SCHEMA_ACTION,
  purchase_phone_number: SCHEMA_ACTION,
  release_phone_number: SCHEMA_ACTION,
  create_sip_trunk: SCHEMA_ACTION,
  update_sip_trunk: SCHEMA_ACTION,
  delete_sip_trunk: SCHEMA_ACTION,
  send_whatsapp_template: SCHEMA_ACTION,
  send_whatsapp_freeform: SCHEMA_ACTION,
  generate_ai_reply: SCHEMA_ACTION,
};

/**
 * Every Famulor tool reaches over HTTP to app.famulor.de, so openWorldHint=true
 * across the board. The other hints depend on what the tool does:
 *
 *   - DESTRUCTIVE_TOOLS  → readOnly=false, destructive=true   (delete / release)
 *   - WRITE_TOOLS        → readOnly=false, destructive=false  (create / update / send)
 *   - everything else    → readOnly=true,  destructive=false  (list / get / search)
 *
 * Idempotency: GET endpoints are idempotent; PUT updates are idempotent if you
 * resend the same body; POST creates and sends are NOT idempotent (each call
 * creates a new row, places a new call, sends a new message). DELETEs are
 * effectively idempotent (a second delete just 404s).
 */
const DESTRUCTIVE_TOOLS = new Set<string>([
  'delete_assistant',
  'delete_call',
  'delete_campaign',
  'delete_lead',
  'delete_mid_call_tool',
  'delete_knowledgebase',
  'delete_document',
  'delete_sip_trunk',
  'release_phone_number',
]);

const WRITE_TOOLS = new Set<string>([
  // assistants
  'create_assistant',
  'update_assistant',
  'enable_assistant_inbound_webhook',
  'disable_assistant_inbound_webhook',
  'enable_assistant_conversation_ended_webhook',
  'disable_assistant_conversation_ended_webhook',
  'disable_assistant_webhook',
  // calls
  'make_call',
  // conversations
  'create_conversation',
  'send_message',
  'enable_conversation_ai',
  'disable_conversation_ai',
  // campaigns
  'create_campaign',
  'update_campaign_status',
  // leads
  'create_lead',
  'update_lead',
  // sms
  'send_sms',
  // mid-call tools
  'create_mid_call_tool',
  'update_mid_call_tool',
  // knowledgebases
  'create_knowledgebase',
  'update_knowledgebase',
  'create_document',
  'update_document',
  // phone numbers
  'purchase_phone_number',
  // sip trunks
  'create_sip_trunk',
  'update_sip_trunk',
  // whatsapp
  'send_whatsapp_template',
  'send_whatsapp_freeform',
  // ai replies
  'generate_ai_reply',
]);

const IDEMPOTENT_WRITES = new Set<string>([
  'update_assistant',
  'update_lead',
  'update_campaign_status',
  'update_mid_call_tool',
  'update_knowledgebase',
  'update_document',
  'update_sip_trunk',
  'enable_assistant_inbound_webhook',
  'disable_assistant_inbound_webhook',
  'enable_assistant_conversation_ended_webhook',
  'disable_assistant_conversation_ended_webhook',
  'disable_assistant_webhook',
  'enable_conversation_ai',
  'disable_conversation_ai',
]);

/**
 * Human-readable titles shown in client UIs (required by the Claude /
 * MCP directory review: every tool must carry a `title` annotation).
 */
const TITLES: Record<string, string> = {
  // user
  get_me: 'Get account profile',
  // assistants: read
  get_assistants: 'List assistants',
  get_outbound_assistants: 'List outbound assistants',
  get_phone_numbers: 'List attachable phone numbers',
  get_models: 'List models',
  get_voices: 'List voices',
  get_languages: 'List languages',
  get_synthesizer_providers: 'List TTS providers',
  get_transcriber_providers: 'List STT providers',
  // assistants: write
  create_assistant: 'Create assistant',
  update_assistant: 'Update assistant',
  delete_assistant: 'Delete assistant',
  enable_assistant_inbound_webhook: 'Enable inbound webhook',
  disable_assistant_inbound_webhook: 'Disable inbound webhook',
  enable_assistant_conversation_ended_webhook: 'Enable conversation-ended webhook',
  disable_assistant_conversation_ended_webhook: 'Disable conversation-ended webhook',
  disable_assistant_webhook: 'Disable post-call webhook',
  // calls
  make_call: 'Make outbound call',
  get_call: 'Get call',
  list_calls: 'List calls',
  delete_call: 'Delete call',
  // conversations
  list_conversations: 'List conversations',
  get_conversation: 'Get conversation',
  create_conversation: 'Start conversation',
  send_message: 'Send chat message',
  enable_conversation_ai: 'Enable AI replies',
  disable_conversation_ai: 'Disable AI replies',
  // campaigns
  list_campaigns: 'List campaigns',
  create_campaign: 'Create campaign',
  update_campaign_status: 'Start or stop campaign',
  delete_campaign: 'Delete campaign',
  // leads
  list_leads: 'List leads',
  create_lead: 'Create lead',
  update_lead: 'Update lead',
  delete_lead: 'Delete lead',
  // sms
  send_sms: 'Send SMS',
  // mid-call tools
  list_mid_call_tools: 'List mid-call tools',
  get_mid_call_tool: 'Get mid-call tool',
  create_mid_call_tool: 'Create mid-call tool',
  update_mid_call_tool: 'Update mid-call tool',
  delete_mid_call_tool: 'Delete mid-call tool',
  // knowledgebases
  list_knowledgebases: 'List knowledge bases',
  get_knowledgebase: 'Get knowledge base',
  create_knowledgebase: 'Create knowledge base',
  update_knowledgebase: 'Update knowledge base',
  delete_knowledgebase: 'Delete knowledge base',
  list_documents: 'List documents',
  get_document: 'Get document',
  create_document: 'Add document',
  update_document: 'Update document',
  delete_document: 'Delete document',
  // phone numbers
  list_all_phone_numbers: 'List all phone numbers',
  search_phone_numbers: 'Search phone numbers',
  purchase_phone_number: 'Purchase phone number',
  release_phone_number: 'Release phone number',
  // sip trunks
  list_sip_trunks: 'List SIP trunks',
  get_sip_trunk: 'Get SIP trunk',
  create_sip_trunk: 'Create SIP trunk',
  update_sip_trunk: 'Update SIP trunk',
  delete_sip_trunk: 'Delete SIP trunk',
  // whatsapp
  get_whatsapp_senders: 'List WhatsApp senders',
  get_whatsapp_templates: 'List WhatsApp templates',
  get_whatsapp_session_status: 'Check WhatsApp session',
  send_whatsapp_template: 'Send WhatsApp template',
  send_whatsapp_freeform: 'Send WhatsApp message',
  // ai replies
  generate_ai_reply: 'Generate AI reply',
};

function classify(name: string): ToolAnnotations {
  if (DESTRUCTIVE_TOOLS.has(name)) {
    return {
      readOnlyHint: false,
      destructiveHint: true,
      idempotentHint: true, // a second delete is a no-op (404)
      openWorldHint: true,
    };
  }
  if (WRITE_TOOLS.has(name)) {
    return {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: IDEMPOTENT_WRITES.has(name),
      openWorldHint: true,
    };
  }
  return {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: true,
  };
}

const ASSISTANT_CONFIG_PROPERTIES: Record<string, unknown> = {
  name: { type: 'string', description: 'Display name of the assistant (max 255 chars)' },
  voice_id: { type: 'integer', description: 'Voice ID from get_voices' },
  language_id: { type: 'integer', description: 'Primary language ID from get_languages' },
  secondary_language_ids: {
    type: 'array',
    items: { type: 'integer' },
    description: 'Additional language IDs the assistant can speak',
  },
  type: { type: 'string', enum: ['inbound', 'outbound'], description: 'Assistant call direction' },
  mode: { type: 'string', enum: ['pipeline', 'multimodal', 'dualplex'] },
  timezone: { type: 'string', description: 'IANA timezone, e.g. "Europe/Berlin"' },
  initial_message: { type: 'string', description: 'First message spoken at call start (max 200 chars)' },
  system_prompt: { type: 'string', description: 'System prompt defining behavior' },
  llm_model_id: { type: 'integer', description: 'Required for mode=pipeline' },
  multimodal_model_id: { type: 'integer', description: 'Required for mode=multimodal/dualplex' },
  chat_llm_fallback_id: { type: 'integer' },
  turn_detection_threshold: { type: 'number' },
  knowledgebase_id: { type: 'integer' },
  knowledgebase_mode: { type: 'string', enum: ['function_call', 'prompt'] },
  phone_number_id: { type: ['integer', 'null'] },
  tool_ids: { type: 'array', items: { type: 'integer' } },
  tools: { type: 'array', items: { type: 'object', additionalProperties: true } },
  tts_emotion_enabled: { type: 'boolean' },
  voice_stability: { type: 'number' },
  voice_similarity: { type: 'number' },
  speech_speed: { type: 'number' },
  llm_temperature: { type: 'number' },
  synthesizer_provider_id: { type: 'integer' },
  transcriber_provider_id: { type: 'integer' },
  allow_interruptions: { type: 'boolean' },
  fillers: { type: 'boolean' },
  filler_config: { type: 'object', additionalProperties: true },
  record: { type: 'boolean' },
  enable_noise_cancellation: { type: 'boolean' },
  wait_for_customer: { type: 'boolean' },
  max_duration: { type: 'integer' },
  max_silence_duration: { type: 'integer' },
  max_initial_silence_duration: { type: 'integer' },
  ringing_time: { type: 'integer' },
  reengagement_interval: { type: 'integer' },
  reengagement_prompt: { type: 'string' },
  end_call_on_voicemail: { type: 'boolean' },
  voice_mail_message: { type: 'string' },
  endpoint_type: { type: 'string', enum: ['vad', 'ai'] },
  endpoint_sensitivity: { type: 'number' },
  interrupt_sensitivity: { type: 'number' },
  min_interrupt_words: { type: 'integer' },
  ambient_sound: { type: 'string' },
  ambient_sound_volume: { type: 'number' },
  is_webhook_active: { type: 'boolean' },
  webhook_url: { type: ['string', 'null'] },
  send_webhook_only_on_completed: { type: 'boolean' },
  include_recording_in_webhook: { type: 'boolean' },
  post_call_evaluation: { type: 'boolean' },
  post_call_schema: {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        type: { type: 'string', enum: ['string', 'number', 'bool'] },
        description: { type: 'string' },
      },
      required: ['name', 'type', 'description'],
    },
  },
  variables: { type: 'object', additionalProperties: true },
  conversation_inactivity_timeout: { type: 'integer' },
  conversation_ended_retrigger: { type: 'boolean' },
  conversation_ended_webhook_url: { type: 'string' },
};

const TOOLS: ToolDef[] = [
  // -- User
  {
    name: 'get_me',
    description: 'Get the authenticated Famulor user profile, including total balance.',
    inputSchema: Schema({}),
  },

  // -- Assistants: read
  {
    name: 'get_assistants',
    description:
      'List all AI assistants on the Famulor account (paginated). Returns the assistant configurations including their fixed variable names.',
    inputSchema: Schema({
      page: { type: 'integer' },
      per_page: { type: 'integer' },
    }),
  },
  {
    name: 'get_outbound_assistants',
    description: 'List all outbound-capable assistants.',
    inputSchema: Schema({}),
  },
  {
    name: 'get_phone_numbers',
    description: 'List phone numbers eligible to be attached to an assistant (filter by inbound/outbound).',
    inputSchema: Schema({
      type: { type: 'string', enum: ['inbound', 'outbound'] },
    }),
  },
  {
    name: 'get_models',
    description: 'List available LLM / multimodal / dualplex model IDs.',
    inputSchema: Schema({
      type: { type: 'string', enum: ['llm', 'multimodal', 'dualplex'] },
    }),
  },
  {
    name: 'get_voices',
    description: 'List voices compatible with a given engine mode and optional language.',
    inputSchema: Schema({
      mode: { type: 'string', enum: ['pipeline', 'multimodal', 'dualplex'] },
      language_id: { type: 'integer' },
    }),
  },
  {
    name: 'get_languages',
    description: 'List all supported assistant languages.',
    inputSchema: Schema({}),
  },
  {
    name: 'get_synthesizer_providers',
    description: 'List custom TTS providers selectable on an assistant.',
    inputSchema: Schema({}),
  },
  {
    name: 'get_transcriber_providers',
    description: 'List custom STT providers selectable on a pipeline assistant.',
    inputSchema: Schema({}),
  },

  // -- Assistants: write
  {
    name: 'create_assistant',
    description:
      'Create a new AI assistant. Required: name, voice_id, language_id, type, mode, timezone, initial_message, system_prompt, and either llm_model_id (pipeline) or multimodal_model_id (multimodal/dualplex). For multimodal/dualplex, knowledgebase_mode must be "function_call" when a knowledgebase is attached.',
    inputSchema: Schema(ASSISTANT_CONFIG_PROPERTIES, [
      'name',
      'voice_id',
      'language_id',
      'type',
      'mode',
      'timezone',
      'initial_message',
      'system_prompt',
    ]),
  },
  {
    name: 'update_assistant',
    description: 'Update an existing assistant (partial). Only the fields you send are changed.',
    inputSchema: Schema(
      { id: { type: 'integer', description: 'Assistant ID to update' }, ...ASSISTANT_CONFIG_PROPERTIES },
      ['id']
    ),
  },
  {
    name: 'delete_assistant',
    description: 'Permanently delete an assistant. Cannot be undone.',
    inputSchema: Schema({ id: { type: 'integer' } }, ['id']),
  },

  // -- Assistants: webhooks
  {
    name: 'enable_assistant_inbound_webhook',
    description: 'Enable inbound-call webhook notifications for an assistant.',
    inputSchema: Schema(
      {
        assistant_id: { type: 'integer' },
        webhook_url: { type: 'string', description: 'HTTPS URL that receives the webhook payload' },
      },
      ['assistant_id', 'webhook_url']
    ),
  },
  {
    name: 'disable_assistant_inbound_webhook',
    description: 'Disable inbound-call webhook notifications.',
    inputSchema: Schema({ assistant_id: { type: 'integer' } }, ['assistant_id']),
  },
  {
    name: 'enable_assistant_conversation_ended_webhook',
    description: 'Enable conversation-ended (chat) webhook for an assistant.',
    inputSchema: Schema(
      { assistant_id: { type: 'integer' }, webhook_url: { type: 'string' } },
      ['assistant_id', 'webhook_url']
    ),
  },
  {
    name: 'disable_assistant_conversation_ended_webhook',
    description: 'Disable conversation-ended (chat) webhook.',
    inputSchema: Schema({ assistant_id: { type: 'integer' } }, ['assistant_id']),
  },
  {
    name: 'disable_assistant_webhook',
    description: 'Disable the post-call webhook for an assistant.',
    inputSchema: Schema({ assistant_id: { type: 'integer' } }, ['assistant_id']),
  },

  // -- Calls
  {
    name: 'make_call',
    description: 'Initiate an outbound AI phone call with a configured assistant.',
    inputSchema: Schema(
      {
        assistant_id: { type: 'string', description: 'Assistant UUID or ID' },
        phone_number: { type: 'string', description: 'E.164-formatted destination number' },
        variables: { type: 'object', additionalProperties: true },
      },
      ['assistant_id', 'phone_number']
    ),
  },
  {
    name: 'get_call',
    description: 'Retrieve a single call by ID.',
    inputSchema: Schema({ call_id: { type: 'string' } }, ['call_id']),
  },
  {
    name: 'list_calls',
    description: 'List calls with pagination and optional assistant filter.',
    inputSchema: Schema({
      assistant_id: { type: 'string' },
      page: { type: 'integer' },
      per_page: { type: 'integer' },
    }),
  },
  {
    name: 'delete_call',
    description: 'Delete a call record. Cannot be undone.',
    inputSchema: Schema({ call_id: { type: 'string' } }, ['call_id']),
  },

  // -- Conversations
  {
    name: 'list_conversations',
    description: 'List conversations across your assistants with cursor pagination and filters.',
    inputSchema: Schema({
      type: { type: 'string', enum: ['test', 'widget', 'whatsapp', 'api'] },
      assistant_id: { type: 'integer' },
      customer_phone: { type: 'string' },
      whatsapp_sender_phone: { type: 'string' },
      external_identifier: { type: 'string' },
      per_page: { type: 'integer' },
      cursor: { type: 'string' },
    }),
  },
  {
    name: 'get_conversation',
    description: 'Get the full message history of a chat conversation by UUID.',
    inputSchema: Schema({ uuid: { type: 'string' } }, ['uuid']),
  },
  {
    name: 'create_conversation',
    description: 'Start a new chat session with an assistant (widget=paid, test=free).',
    inputSchema: Schema(
      {
        assistant_id: { type: 'string' },
        type: { type: 'string', enum: ['widget', 'test'] },
        variables: { type: 'object', additionalProperties: true },
      },
      ['assistant_id']
    ),
  },
  {
    name: 'send_message',
    description: 'Send a user message in an existing chat conversation and get the assistant reply.',
    inputSchema: Schema(
      {
        uuid: { type: 'string' },
        message: { type: 'string', description: 'User message (max 2000 chars)' },
      },
      ['uuid', 'message']
    ),
  },
  {
    name: 'enable_conversation_ai',
    description: 'Re-enable AI replies for a conversation after a human takeover.',
    inputSchema: Schema({ uuid: { type: 'string' } }, ['uuid']),
  },
  {
    name: 'disable_conversation_ai',
    description: 'Disable AI replies for a conversation so a human can take over.',
    inputSchema: Schema({ uuid: { type: 'string' } }, ['uuid']),
  },

  // -- Campaigns
  {
    name: 'list_campaigns',
    description: 'List all outbound calling campaigns.',
    inputSchema: Schema({}),
  },
  {
    name: 'create_campaign',
    description: 'Create a new outbound campaign tied to an outbound-capable assistant.',
    inputSchema: Schema(
      {
        name: { type: 'string', description: 'Campaign name (max 255 chars)' },
        assistant_id: { type: 'integer' },
        timezone: { type: 'string' },
        max_calls_in_parallel: { type: 'integer' },
        allowed_hours_start_time: { type: 'string', description: 'H:i, e.g. "09:00"' },
        allowed_hours_end_time: { type: 'string', description: 'H:i, e.g. "17:00"' },
        allowed_days: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
          },
        },
        max_retries: { type: 'integer' },
        retry_interval: { type: 'integer' },
        retry_on_voicemail: { type: 'boolean' },
        retry_on_goal_incomplete: { type: 'boolean' },
        goal_completion_variable: { type: 'string' },
        mark_complete_when_no_leads: { type: 'boolean' },
      },
      ['name', 'assistant_id']
    ),
  },
  {
    name: 'update_campaign_status',
    description: 'Start or stop a campaign.',
    inputSchema: Schema(
      {
        campaign_id: { type: 'integer' },
        action: { type: 'string', enum: ['start', 'stop'] },
      },
      ['campaign_id', 'action']
    ),
  },
  {
    name: 'delete_campaign',
    description: 'Delete a campaign. Cannot be undone.',
    inputSchema: Schema({ id: { type: 'integer' } }, ['id']),
  },

  // -- Leads
  {
    name: 'list_leads',
    description: 'List leads with pagination.',
    inputSchema: Schema({ page: { type: 'integer' }, per_page: { type: 'integer' } }),
  },
  {
    name: 'create_lead',
    description:
      'Create a new lead in a campaign. IMPORTANT: variable names come from the associated assistant configuration and are fixed; only their values can be supplied here.',
    inputSchema: Schema(
      {
        phone_number: { type: 'string', description: 'E.164 format, e.g. +491234567890' },
        campaign_id: { type: 'integer' },
        variables: {
          description:
            'Either an object (key/value pairs matching assistant variables) or an array of such objects.',
          oneOf: [
            { type: 'object', additionalProperties: true },
            { type: 'array', items: { type: 'object', additionalProperties: true } },
          ],
        },
        allow_dupplicate: { type: 'boolean' },
        secondary_contacts: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              phone_number: { type: 'string' },
              variables: { type: 'object', additionalProperties: true },
            },
            required: ['phone_number'],
          },
        },
      },
      ['phone_number', 'campaign_id']
    ),
  },
  {
    name: 'update_lead',
    description: 'Update a lead. Variables are merged with existing ones.',
    inputSchema: Schema(
      {
        id: { type: 'integer' },
        campaign_id: { type: 'integer' },
        phone_number: { type: 'string' },
        status: { type: 'string', enum: ['created', 'completed', 'reached-max-retries'] },
        variables: { type: 'object', additionalProperties: true },
      },
      ['id']
    ),
  },
  {
    name: 'delete_lead',
    description: 'Delete a lead.',
    inputSchema: Schema({ id: { type: 'integer' } }, ['id']),
  },

  // -- SMS
  {
    name: 'send_sms',
    description:
      'Send an SMS from one of your Famulor phone numbers (must be SMS-capable). Costs are deducted from your balance.',
    inputSchema: Schema(
      {
        from: { type: 'integer', description: 'Phone number ID' },
        to: { type: 'string', description: 'Recipient in E.164 format' },
        body: { type: 'string', description: 'Message body (max 300 chars)' },
      },
      ['from', 'to', 'body']
    ),
  },

  // -- Mid-call tools
  {
    name: 'list_mid_call_tools',
    description: 'List mid-call tools (HTTP integrations callable by an assistant during a call).',
    inputSchema: Schema({}),
  },
  {
    name: 'get_mid_call_tool',
    description: 'Get a single mid-call tool by ID.',
    inputSchema: Schema({ id: { type: 'integer' } }, ['id']),
  },
  {
    name: 'create_mid_call_tool',
    description: 'Create a new mid-call HTTP tool.',
    inputSchema: Schema(
      {
        name: {
          type: 'string',
          description: 'Tool identifier: lowercase letters and underscores, starts with a letter',
        },
        description: { type: 'string', description: 'When the AI should use it (max 255 chars)' },
        endpoint: { type: 'string', description: 'HTTPS URL to call' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
        timeout: { type: 'integer', description: 'Seconds, 1-30' },
        headers: {
          type: 'array',
          items: {
            type: 'object',
            properties: { name: { type: 'string' }, value: { type: 'string' } },
            required: ['name', 'value'],
          },
        },
        schema: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: { type: 'string', enum: ['string', 'number', 'boolean'] },
              description: { type: 'string' },
            },
            required: ['name', 'type', 'description'],
          },
        },
      },
      ['name', 'description', 'endpoint', 'method']
    ),
  },
  {
    name: 'update_mid_call_tool',
    description: 'Update a mid-call tool. headers/schema fully replace existing values when provided.',
    inputSchema: Schema(
      {
        id: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'string' },
        endpoint: { type: 'string' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
        timeout: { type: 'integer' },
        headers: { type: 'array', items: { type: 'object', additionalProperties: true } },
        schema: { type: 'array', items: { type: 'object', additionalProperties: true } },
      },
      ['id']
    ),
  },
  {
    name: 'delete_mid_call_tool',
    description: 'Delete a mid-call tool.',
    inputSchema: Schema({ id: { type: 'integer' } }, ['id']),
  },

  // -- Knowledgebases
  {
    name: 'list_knowledgebases',
    description: 'List all knowledge bases on the account.',
    inputSchema: Schema({}),
  },
  {
    name: 'get_knowledgebase',
    description: 'Get a knowledge base by ID.',
    inputSchema: Schema({ id: { type: 'integer' } }, ['id']),
  },
  {
    name: 'create_knowledgebase',
    description: 'Create a new knowledge base.',
    inputSchema: Schema(
      {
        name: { type: 'string', description: 'Max 255 chars' },
        description: { type: 'string', description: 'Optional, max 255 chars' },
      },
      ['name']
    ),
  },
  {
    name: 'update_knowledgebase',
    description: 'Rename or describe an existing knowledge base.',
    inputSchema: Schema(
      {
        id: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'string' },
      },
      ['id']
    ),
  },
  {
    name: 'delete_knowledgebase',
    description: 'Delete a knowledge base permanently.',
    inputSchema: Schema({ id: { type: 'integer' } }, ['id']),
  },
  {
    name: 'list_documents',
    description: 'List documents in a knowledge base.',
    inputSchema: Schema({ knowledgebase_id: { type: 'integer' } }, ['knowledgebase_id']),
  },
  {
    name: 'get_document',
    description: 'Get a single document by ID.',
    inputSchema: Schema(
      { knowledgebase_id: { type: 'integer' }, document_id: { type: 'integer' } },
      ['knowledgebase_id', 'document_id']
    ),
  },
  {
    name: 'create_document',
    description:
      'Add a website (URL-scraped) document to a knowledge base. File uploads (pdf/txt/docx) must use the Famulor dashboard or a direct multipart/form-data call.',
    inputSchema: Schema(
      {
        knowledgebase_id: { type: 'integer' },
        name: { type: 'string', description: 'Max 255 chars' },
        description: { type: 'string', description: 'Optional, max 255 chars' },
        type: { type: 'string', enum: ['website'], description: 'Only website is supported via MCP' },
        url: { type: 'string', description: 'Main URL to scrape (required if links is not set)' },
        links: {
          type: 'array',
          items: { type: 'object', properties: { link: { type: 'string' } }, required: ['link'] },
        },
        relative_links_limit: { type: 'integer' },
      },
      ['knowledgebase_id', 'name', 'type']
    ),
  },
  {
    name: 'update_document',
    description: 'Update a document name or description. Content cannot be changed.',
    inputSchema: Schema(
      {
        knowledgebase_id: { type: 'integer' },
        document_id: { type: 'integer' },
        name: { type: 'string' },
        description: { type: 'string' },
      },
      ['knowledgebase_id', 'document_id']
    ),
  },
  {
    name: 'delete_document',
    description: 'Delete a document from a knowledge base.',
    inputSchema: Schema(
      { knowledgebase_id: { type: 'integer' }, document_id: { type: 'integer' } },
      ['knowledgebase_id', 'document_id']
    ),
  },

  // -- Phone numbers
  {
    name: 'list_all_phone_numbers',
    description: 'List every phone number on the account (regardless of SMS or subscription status).',
    inputSchema: Schema({}),
  },
  {
    name: 'search_phone_numbers',
    description: 'Search for purchasable phone numbers via the Famulor provider.',
    inputSchema: Schema({
      country_code: { type: 'string', description: 'ISO 3166-1 alpha-2, default DE' },
      contains: { type: 'string', description: 'Digits the number should contain (numeric only, max 10)' },
    }),
  },
  {
    name: 'purchase_phone_number',
    description: 'Purchase a phone number returned by search_phone_numbers (monthly subscription).',
    inputSchema: Schema({ phone_number: { type: 'string' } }, ['phone_number']),
  },
  {
    name: 'release_phone_number',
    description: 'Release (cancel) a purchased phone number.',
    inputSchema: Schema({ id: { type: 'integer' } }, ['id']),
  },

  // -- SIP trunks
  {
    name: 'list_sip_trunks',
    description: 'List all SIP trunks on the account.',
    inputSchema: Schema({}),
  },
  {
    name: 'get_sip_trunk',
    description: 'Get a SIP trunk by ID.',
    inputSchema: Schema({ id: { type: 'integer' } }, ['id']),
  },
  {
    name: 'create_sip_trunk',
    description: 'Provision a new SIP trunk (extension or DID number).',
    inputSchema: Schema(
      {
        sip_trunk_type: { type: 'string', enum: ['extension', 'number'] },
        phone_number: { type: 'string', description: 'Extension (1-15 chars) or E.164 number' },
        sip_username: { type: 'string', description: '3-128 chars' },
        sip_password: { type: 'string', description: 'Min 3 chars' },
        sip_address: { type: 'string', description: 'SIP server without port' },
        sip_calling_format: { type: 'string', enum: ['+e164', 'e164', 'national'] },
        inbound_authorization_type: { type: 'string', enum: ['auth', 'ip'] },
        allowed_inbound_ips: { type: 'array', items: { type: 'string' } },
        country_code: { type: 'string', description: 'ISO 3166-2, e.g. US/GB/DE' },
        outbound_proxy: { type: 'boolean' },
      },
      [
        'sip_trunk_type',
        'phone_number',
        'sip_username',
        'sip_password',
        'sip_address',
        'sip_calling_format',
        'inbound_authorization_type',
        'country_code',
      ]
    ),
  },
  {
    name: 'update_sip_trunk',
    description: 'Update a SIP trunk (partial).',
    inputSchema: Schema(
      {
        id: { type: 'integer' },
        phone_number: { type: 'string' },
        sip_username: { type: 'string' },
        sip_password: { type: 'string' },
        sip_address: { type: 'string' },
        sip_calling_format: { type: 'string', enum: ['+e164', 'e164', 'national'] },
        inbound_authorization_type: { type: 'string', enum: ['auth', 'ip'] },
        allowed_inbound_ips: { type: 'array', items: { type: 'string' } },
        country_code: { type: 'string' },
        outbound_proxy: { type: 'boolean' },
      },
      ['id']
    ),
  },
  {
    name: 'delete_sip_trunk',
    description: 'Delete a SIP trunk by phone-number ID.',
    inputSchema: Schema({ id: { type: 'integer' } }, ['id']),
  },

  // -- WhatsApp
  {
    name: 'get_whatsapp_senders',
    description: 'List WhatsApp Business senders. status defaults to "online" — pass "all" to see all.',
    inputSchema: Schema({ status: { type: 'string' } }),
  },
  {
    name: 'get_whatsapp_templates',
    description: 'List approved templates for a WhatsApp sender (status defaults to "approved").',
    inputSchema: Schema(
      { sender_id: { type: 'integer' }, status: { type: 'string' } },
      ['sender_id']
    ),
  },
  {
    name: 'get_whatsapp_session_status',
    description: 'Check whether a 24h messaging window is open for a recipient.',
    inputSchema: Schema(
      { sender_id: { type: 'integer' }, recipient_phone: { type: 'string' } },
      ['sender_id', 'recipient_phone']
    ),
  },
  {
    name: 'send_whatsapp_template',
    description:
      'Send a WhatsApp template message (required when initiating or outside the 24h window).',
    inputSchema: Schema(
      {
        sender_id: { type: 'integer' },
        template_id: { type: 'integer' },
        recipient_phone: { type: 'string', description: 'E.164' },
        recipient_name: { type: 'string' },
        variables: { type: 'object', additionalProperties: true },
      },
      ['sender_id', 'template_id', 'recipient_phone']
    ),
  },
  {
    name: 'send_whatsapp_freeform',
    description:
      'Send a freeform WhatsApp message. Requires an open 24h session (use get_whatsapp_session_status to check).',
    inputSchema: Schema(
      {
        sender_id: { type: 'integer' },
        recipient_phone: { type: 'string' },
        message: { type: 'string', description: 'Max 4096 chars' },
      },
      ['sender_id', 'recipient_phone', 'message']
    ),
  },

  // -- AI replies
  {
    name: 'generate_ai_reply',
    description:
      'Generate a context-aware AI reply for a customer message. The system keeps conversation state per customer_identifier (e.g. phone, email, CRM ID).',
    inputSchema: Schema(
      {
        assistant_id: { type: 'integer' },
        customer_identifier: { type: 'string', description: 'Stable per-customer ID; max 255 chars' },
        message: { type: 'string' },
        variables: { type: 'object', additionalProperties: true },
      },
      ['assistant_id', 'customer_identifier', 'message']
    ),
  },
];

export async function setupFamulorServer(server: Server): Promise<void> {
  if (!(server as any).userConfig) {
    (server as any).userConfig = {};
  }

  await registerAllTools(server);

  const toolsWithAnnotations = TOOLS.map((t) => {
    const annotations = t.annotations ?? classify(t.name);
    return {
      ...t,
      annotations: { title: TITLES[t.name] ?? t.name, ...annotations },
      outputSchema: t.outputSchema ?? OUTPUT_SCHEMAS[t.name] ?? SCHEMA_SINGLE,
    };
  });

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: toolsWithAnnotations,
  }));
}

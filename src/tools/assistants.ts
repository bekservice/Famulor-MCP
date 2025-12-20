/**
 * Assistant Tools
 *
 * Tools for managing Famulor AI assistants
 */

import { FamulorClient } from '../auth/famulor.js';

export async function handleAssistantTools(
  name: string,
  args: unknown,
  client: FamulorClient
) {
  try {
    switch (name) {
      case 'get_assistants': {
        const { page, per_page } = args as {
          page?: number;
          per_page?: number;
        };

        let endpoint = '/api/user/assistants/get';
        const params: string[] = [];
        if (page !== undefined) {
          params.push(`page=${page}`);
        }
        if (per_page !== undefined) {
          params.push(`per_page=${per_page}`);
        }
        if (params.length > 0) {
          endpoint += `?${params.join('&')}`;
        }

        const result = await client.get(endpoint);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_phone_numbers': {
        const { type } = args as { type?: 'inbound' | 'outbound' };
        let endpoint = '/api/user/assistants/phone-numbers';
        if (type) {
          endpoint += `?type=${type}`;
        }
        const result = await client.get(endpoint);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_models': {
        const result = await client.get('/api/user/assistants/models');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_voices': {
        const { mode } = args as { mode?: 'pipeline' | 'multimodal' };
        let endpoint = '/api/user/assistants/voices';
        if (mode) {
          endpoint += `?mode=${mode}`;
        }
        const result = await client.get(endpoint);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'get_languages': {
        const result = await client.get('/api/user/assistants/languages');

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case 'update_assistant': {
        const {
          id,
          assistant_name,
          voice_id,
          language,
          llm_model,
          calls_direction,
          engine_type,
          timezone,
          initial_message,
          system_prompt,
          phone_number_id,
          tool_ids,
          endpoint_type,
          endpoint_sensitivity,
          interrupt_sensitivity,
          ambient_sound_volume,
          post_call_evaluation,
          send_webhook_only_on_completed,
          include_recording_in_webhook,
          is_webhook_active,
          webhook_url,
          use_min_interrupt_words,
          min_interrupt_words,
          variables,
          post_call_schema,
          end_call_tool,
          llm_temperature,
          voice_stability,
          voice_similarity,
          speech_speed,
          allow_interruptions,
          filler_audios,
          re_engagement_interval,
          max_call_duration,
          max_silence_duration,
          end_call_on_voicemail,
          noise_cancellation,
          record_call,
          who_speaks_first,
        } = args as {
          id: number;
          assistant_name?: string;
          voice_id?: number;
          language?: string;
          llm_model?: string;
          calls_direction?: 'receive' | 'make';
          engine_type?: 'pipeline' | 'multimodal';
          timezone?: string;
          initial_message?: string;
          system_prompt?: string;
          phone_number_id?: number | null;
          tool_ids?: number[];
          endpoint_type?: 'vad' | 'ai';
          endpoint_sensitivity?: number;
          interrupt_sensitivity?: number;
          ambient_sound_volume?: number;
          post_call_evaluation?: boolean;
          send_webhook_only_on_completed?: boolean;
          include_recording_in_webhook?: boolean;
          is_webhook_active?: boolean;
          webhook_url?: string | null;
          use_min_interrupt_words?: boolean;
          min_interrupt_words?: number;
          variables?: Record<string, unknown>;
          post_call_schema?: Array<{
            name: string;
            type: 'string' | 'number' | 'bool';
            description: string;
          }>;
          end_call_tool?: {
            description?: string;
          };
          llm_temperature?: number;
          voice_stability?: number;
          voice_similarity?: number;
          speech_speed?: number;
          allow_interruptions?: boolean;
          filler_audios?: boolean;
          re_engagement_interval?: number;
          max_call_duration?: number;
          max_silence_duration?: number;
          end_call_on_voicemail?: boolean;
          noise_cancellation?: boolean;
          record_call?: boolean;
          who_speaks_first?: 'AI assistant' | 'Customer';
        };

        const body: Record<string, unknown> = {};
        if (assistant_name !== undefined) body.assistant_name = assistant_name;
        if (voice_id !== undefined) body.voice_id = voice_id;
        if (language !== undefined) body.language = language;
        if (llm_model !== undefined) body.llm_model = llm_model;
        if (calls_direction !== undefined) body.calls_direction = calls_direction;
        if (engine_type !== undefined) body.engine_type = engine_type;
        if (timezone !== undefined) body.timezone = timezone;
        if (initial_message !== undefined) body.initial_message = initial_message;
        if (system_prompt !== undefined) body.system_prompt = system_prompt;
        if (phone_number_id !== undefined) body.phone_number_id = phone_number_id;
        if (tool_ids !== undefined) body.tool_ids = tool_ids;
        if (endpoint_type !== undefined) body.endpoint_type = endpoint_type;
        if (endpoint_sensitivity !== undefined)
          body.endpoint_sensitivity = endpoint_sensitivity;
        if (interrupt_sensitivity !== undefined)
          body.interrupt_sensitivity = interrupt_sensitivity;
        if (ambient_sound_volume !== undefined)
          body.ambient_sound_volume = ambient_sound_volume;
        if (post_call_evaluation !== undefined)
          body.post_call_evaluation = post_call_evaluation;
        if (send_webhook_only_on_completed !== undefined)
          body.send_webhook_only_on_completed = send_webhook_only_on_completed;
        if (include_recording_in_webhook !== undefined)
          body.include_recording_in_webhook = include_recording_in_webhook;
        if (is_webhook_active !== undefined) body.is_webhook_active = is_webhook_active;
        if (webhook_url !== undefined) body.webhook_url = webhook_url;
        if (use_min_interrupt_words !== undefined)
          body.use_min_interrupt_words = use_min_interrupt_words;
        if (min_interrupt_words !== undefined)
          body.min_interrupt_words = min_interrupt_words;
        if (variables !== undefined) body.variables = variables;
        if (post_call_schema !== undefined) body.post_call_schema = post_call_schema;
        if (end_call_tool !== undefined) body.end_call_tool = end_call_tool;
        if (llm_temperature !== undefined) body.llm_temperature = llm_temperature;
        if (voice_stability !== undefined) body.voice_stability = voice_stability;
        if (voice_similarity !== undefined) body.voice_similarity = voice_similarity;
        if (speech_speed !== undefined) body.speech_speed = speech_speed;
        if (allow_interruptions !== undefined)
          body.allow_interruptions = allow_interruptions;
        if (filler_audios !== undefined) body.filler_audios = filler_audios;
        if (re_engagement_interval !== undefined)
          body.re_engagement_interval = re_engagement_interval;
        if (max_call_duration !== undefined) body.max_call_duration = max_call_duration;
        if (max_silence_duration !== undefined)
          body.max_silence_duration = max_silence_duration;
        if (end_call_on_voicemail !== undefined)
          body.end_call_on_voicemail = end_call_on_voicemail;
        if (noise_cancellation !== undefined) body.noise_cancellation = noise_cancellation;
        if (record_call !== undefined) body.record_call = record_call;
        if (who_speaks_first !== undefined) body.who_speaks_first = who_speaks_first;

        const result = await client.request<{
          message: string;
          data: unknown;
        }>(`/api/user/assistant/${id}`, {
          method: 'PUT',
          body: JSON.stringify(body),
        });

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown assistant tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
}


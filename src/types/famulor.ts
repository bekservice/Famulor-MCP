/**
 * TypeScript Types for Famulor API
 */

export interface FamulorCall {
  id: string;
  assistant_id: string;
  phone_number: string;
  status: 'pending' | 'ringing' | 'in_progress' | 'completed' | 'failed';
  duration?: number;
  transcript?: string;
  recording_url?: string;
  variables?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface FamulorAssistant {
  id: string;
  name: string;
  description?: string;
  language: string;
  voice: string;
  model: string;
  phone_number?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface MakeCallRequest {
  assistant_id: string;
  phone_number: string;
  variables?: Record<string, unknown>;
}

export interface MakeCallResponse {
  call: FamulorCall;
  message: string;
}

export interface ListCallsResponse {
  calls: FamulorCall[];
  total: number;
  limit: number;
  offset: number;
}

export interface ListAssistantsResponse {
  assistants: FamulorAssistant[];
  total: number;
}


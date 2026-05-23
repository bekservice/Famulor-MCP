/**
 * OAuth 2.0 + PKCE helpers for the Famulor MCP server.
 *
 * Tokens and authorization codes are stateless — they are JSON blobs
 * encrypted with AES-256-GCM using MCP_SECRET. This avoids any persistent
 * storage requirement on Vercel.
 *
 * The authorization code carries the Famulor API key plus the PKCE
 * code_challenge so /token can verify the matching code_verifier.
 * The access token carries the Famulor API key. Both have an expiry.
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes, scryptSync } from 'node:crypto';

const ALGO = 'aes-256-gcm';

function getKey(): Buffer {
  const secret = process.env.MCP_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error(
      'MCP_SECRET environment variable must be set to a strong random string (>= 16 chars).'
    );
  }
  return scryptSync(secret, 'famulor-mcp', 32);
}

function b64url(buf: Buffer): string {
  return buf.toString('base64').replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function b64urlDecode(s: string): Buffer {
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  return Buffer.from(s, 'base64');
}

export function encryptPayload(payload: object): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGO, key, iv);
  const plaintext = Buffer.from(JSON.stringify(payload), 'utf8');
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  // Layout: iv(12) | tag(16) | ciphertext
  return b64url(Buffer.concat([iv, tag, encrypted]));
}

export function decryptPayload<T = Record<string, unknown>>(token: string): T {
  const key = getKey();
  const raw = b64urlDecode(token);
  if (raw.length < 12 + 16 + 1) {
    throw new Error('Invalid token format');
  }
  const iv = raw.subarray(0, 12);
  const tag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return JSON.parse(decrypted.toString('utf8')) as T;
}

export interface AuthCodePayload {
  kind: 'code';
  api_key: string;
  code_challenge: string;
  code_challenge_method: 'S256' | 'plain';
  client_id: string;
  redirect_uri: string;
  exp: number;
}

export interface AccessTokenPayload {
  kind: 'token';
  api_key: string;
  client_id: string;
  exp: number;
}

const CODE_TTL_SECONDS = 5 * 60;
const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 30;

export function issueAuthCode(args: {
  apiKey: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256' | 'plain';
  clientId: string;
  redirectUri: string;
}): string {
  const payload: AuthCodePayload = {
    kind: 'code',
    api_key: args.apiKey,
    code_challenge: args.codeChallenge,
    code_challenge_method: args.codeChallengeMethod,
    client_id: args.clientId,
    redirect_uri: args.redirectUri,
    exp: Math.floor(Date.now() / 1000) + CODE_TTL_SECONDS,
  };
  return encryptPayload(payload);
}

export function consumeAuthCode(args: {
  code: string;
  codeVerifier: string;
  clientId: string;
  redirectUri: string;
}): AuthCodePayload {
  let payload: AuthCodePayload;
  try {
    payload = decryptPayload<AuthCodePayload>(args.code);
  } catch {
    throw new OAuthError('invalid_grant', 'Authorization code is invalid or malformed');
  }
  if (payload.kind !== 'code') {
    throw new OAuthError('invalid_grant', 'Token is not an authorization code');
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new OAuthError('invalid_grant', 'Authorization code has expired');
  }
  if (payload.client_id !== args.clientId) {
    throw new OAuthError('invalid_grant', 'client_id does not match the authorization code');
  }
  if (payload.redirect_uri !== args.redirectUri) {
    throw new OAuthError('invalid_grant', 'redirect_uri does not match the authorization code');
  }

  if (payload.code_challenge_method === 'S256') {
    const expected = b64url(createHash('sha256').update(args.codeVerifier).digest());
    if (expected !== payload.code_challenge) {
      throw new OAuthError('invalid_grant', 'PKCE verification failed');
    }
  } else if (payload.code_challenge_method === 'plain') {
    if (args.codeVerifier !== payload.code_challenge) {
      throw new OAuthError('invalid_grant', 'PKCE verification failed');
    }
  } else {
    throw new OAuthError('invalid_grant', 'Unsupported code_challenge_method');
  }

  return payload;
}

export function issueAccessToken(apiKey: string, clientId: string): { token: string; expiresIn: number } {
  const expiresIn = TOKEN_TTL_SECONDS;
  const payload: AccessTokenPayload = {
    kind: 'token',
    api_key: apiKey,
    client_id: clientId,
    exp: Math.floor(Date.now() / 1000) + expiresIn,
  };
  return { token: encryptPayload(payload), expiresIn };
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  let payload: AccessTokenPayload;
  try {
    payload = decryptPayload<AccessTokenPayload>(token);
  } catch {
    throw new OAuthError('invalid_token', 'Access token is invalid or malformed');
  }
  if (payload.kind !== 'token') {
    throw new OAuthError('invalid_token', 'Bearer token is not an access token');
  }
  if (payload.exp < Math.floor(Date.now() / 1000)) {
    throw new OAuthError('invalid_token', 'Access token has expired');
  }
  return payload;
}

export class OAuthError extends Error {
  constructor(public code: string, message: string, public status: number = 400) {
    super(message);
  }
}

export function generateClientId(): string {
  return `famulor_${b64url(randomBytes(16))}`;
}

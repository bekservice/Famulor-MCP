/**
 * Vercel Serverless Function Handler for Famulor MCP Server
 * 
 * This file exports the Express app as a Vercel serverless function.
 */

import express, { Request, Response } from 'express';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { setupFamulorServer } from '../src/server.js';

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'famulor-mcp-server' });
});

// OAuth configuration handler function
// Returns a minimal OAuth config indicating OAuth is not supported
const handleOAuthConfig = (req: Request, res: Response) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');
  
  // Return a minimal OAuth configuration that indicates OAuth is not available
  // This is a valid OAuth metadata response but with empty/null values
  res.status(200).json({
    issuer: null,
    authorization_endpoint: null,
    token_endpoint: null,
    // Indicate that OAuth is not supported
    oauth_supported: false
  });
};

// OAuth configuration endpoints - ChatGPT may check any of these:
// Standard OAuth discovery endpoints
app.get('/.well-known/oauth-authorization-server', handleOAuthConfig);
app.get('/oauth-authorization-server', handleOAuthConfig);

// Endpoints relative to /sse path
app.get('/sse/.well-known/oauth-authorization-server', handleOAuthConfig);
app.get('/sse/oauth-authorization-server', handleOAuthConfig);

// CORS preflight for all OAuth endpoints
const handleOAuthOptions = (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
};

app.options('/.well-known/oauth-authorization-server', handleOAuthOptions);
app.options('/oauth-authorization-server', handleOAuthOptions);
app.options('/sse/.well-known/oauth-authorization-server', handleOAuthOptions);
app.options('/sse/oauth-authorization-server', handleOAuthOptions);

// MCP Server-Sent Events endpoint
app.get('/sse', async (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Extract authentication from Authorization header
  let apiKey: string | undefined;
  let oauthToken: string | undefined;
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    // Validate if it's an OAuth token (64 chars) or API key
    if (token.length === 64 && /^[a-f0-9]+$/.test(token)) {
      // Looks like an OAuth access token - validate it
      try {
        const tokenValidation = await validateOAuthToken(token);
        if (tokenValidation.valid) {
          oauthToken = token;
        } else {
          res.writeHead(401, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            error: 'invalid_token',
            error_description: 'OAuth token is invalid or expired'
          }));
          return;
        }
      } catch (error) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'token_validation_error',
          error_description: 'Failed to validate OAuth token'
        }));
        return;
      }
    } else {
      // Assume it's an API key
      apiKey = token;
    }
  }

  // Require either API key or valid OAuth token
  if (!apiKey && !oauthToken) {
    res.writeHead(401, {
      'Content-Type': 'application/json',
          'WWW-Authenticate': 'Bearer resource_metadata="https://www.famulor.io/.well-known/oauth-protected-resource", error="insufficient_scope", error_description="You need to login or provide an API key"'
    });
    res.end(JSON.stringify({
      error: 'authentication_required',
      error_description: 'Please provide either an API key or authenticate via OAuth'
    }));
    return;
  }

  // Create MCP server instance
  const mcpServer = new Server(
    {
      name: 'famulor-mcp-server',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Store authentication in server config for use by tools
  (mcpServer as any).userConfig = {
    famulor_api_key: apiKey,
    oauth_token: oauthToken,
  };

  // Setup Famulor tools and handlers
  await setupFamulorServer(mcpServer);

  // Create SSE transport
  const transport = new SSEServerTransport('/sse', res);

  // Connect server to transport
  await mcpServer.connect(transport);

  // Handle client disconnect
  req.on('close', () => {
    transport.close();
  });
});

// OAuth Token Validation Helper
async function validateOAuthToken(token: string): Promise<{ valid: boolean; client_id?: string; scope?: string }> {
  try {
    // In a real implementation, you would validate the token against your OAuth server
    // For now, we'll make a request to validate the token
    const response = await fetch('https://www.famulor.io/oauth/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const tokenData = await response.json() as { client_id?: string; scope?: string };
      return {
        valid: true,
        client_id: tokenData.client_id,
        scope: tokenData.scope
      };
    }

    return { valid: false };
  } catch (error) {
    console.error('Token validation error:', error);
    return { valid: false };
  }
}

// CORS preflight
app.options('/sse', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Export the Express app as a Vercel serverless function
export default app;


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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

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

// CORS preflight
app.options('/sse', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.sendStatus(200);
});

// Export the Express app as a Vercel serverless function
export default app;


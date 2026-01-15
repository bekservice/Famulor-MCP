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

// MCP Server-Sent Events endpoint
app.get('/sse', async (req: Request, res: Response) => {
  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Extract API key from Authorization header
  const authHeader = req.headers.authorization;
  let apiKey: string | undefined;

  if (authHeader) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    // All tokens are treated as API keys since OAuth is not supported
    apiKey = token;
  }

  // Require API key for authentication
  if (!apiKey) {
    res.writeHead(401, {
      'Content-Type': 'application/json',
      'WWW-Authenticate': 'Bearer'
    });
    res.end(JSON.stringify({
      error: 'authentication_required',
      error_description: 'Please provide an API key in the Authorization header'
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

// CORS preflight
app.options('/sse', (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(200);
});

// Export the Express app as a Vercel serverless function
export default app;
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

// OAuth configuration endpoint
// Returns null/empty to indicate OAuth is not supported
// The server uses API key authentication instead (configured via Apps SDK)
app.get('/oauth-authorization-server', (req: Request, res: Response) => {
  // Return null to indicate OAuth is not supported
  // OpenAI Apps SDK will handle API key authentication instead
  res.status(200).json(null);
});

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


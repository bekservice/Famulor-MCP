#!/usr/bin/env node

/**
 * Famulor MCP Server - Entry Point
 *
 * This MCP server provides Famulor AI calling capabilities to any
 * MCP-compatible client (ChatGPT Desktop, Claude Desktop, etc.)
 * through the Model Context Protocol (MCP).
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { setupFamulorServer } from './server.js';

async function main() {
  // Create MCP server
  const server = new Server(
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
  await setupFamulorServer(server);

  // Connect to stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Famulor MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});


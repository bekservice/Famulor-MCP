# 🤖 Famulor MCP Server

An MCP (Model Context Protocol) server for the **Famulor Voice Agent Platform** that enables AI-powered phone calls, assistant management, and call data retrieval through ChatGPT and other MCP-compatible clients.

## Overview

This MCP server provides access to the Famulor Voice Agent Platform, allowing users to make AI-powered phone calls, manage voice assistants, and retrieve call transcripts and recordings - all directly from ChatGPT Desktop App or other MCP clients.

## Features

- 📞 **Make Calls** - Initiate AI-powered phone conversations
- 🤖 **Manage Assistants** - Manage your AI assistants
- 📊 **Retrieve Call Data** - Get transcripts, recordings, and metadata
- 🔒 **Secure Authentication** - API key-based authentication

## Prerequisites

- Node.js >= 20.0.0
- A Famulor API key ([Get one here](https://app.famulor.de/api-keys))

## Installation

```bash
npm install
```

## Configuration

**Important**: Each user must configure their own Famulor API key!

### For Local Development (ChatGPT Desktop App)

Local development supports multiple methods:

1. **MCP Config File** (for ChatGPT Desktop App):
   ```json
   {
     "mcpServers": {
       "famulor": {
         "command": "node",
         "args": ["/path/to/dist/index.js"],
         "env": {
           "FAMULOR_API_KEY": "your-api-key"
         }
       }
     }
   }
   ```

2. **Environment Variable**:
   ```bash
   export FAMULOR_API_KEY="your-api-key"
   npm start
   ```

### Get API Key

1. Go to [Famulor API Keys](https://app.famulor.de/api-keys)
2. Create a new API key
3. Copy the API key
4. Use it in the app (depending on deployment method)

## Development

```bash
# Development with Hot Reload
npm run dev

# Build
npm run build

# Production Start
npm start
```

## Project Structure

```
famulor-mcp/
├── src/
│   ├── index.ts          # MCP Server Entry Point
│   ├── server.ts         # MCP Server Setup
│   ├── tools/            # Famulor API Tools
│   │   ├── calls.ts      # Call Operations
│   │   ├── assistants.ts # Assistant Operations
│   │   └── index.ts      # Tools Export
│   ├── auth/             # Authentication
│   │   └── famulor.ts    # Famulor API Client
│   └── types/            # TypeScript Types
│       └── famulor.ts    # Famulor API Types
├── dist/                 # Compiled JavaScript
├── package.json
├── tsconfig.json
└── README.md
```

## About MCP

This is a **Model Context Protocol (MCP) Server** that provides access to the Famulor Voice Agent Platform. MCP is a protocol that allows AI assistants like ChatGPT to securely connect to external data sources and tools.

The server exposes Famulor's voice agent capabilities as MCP tools, enabling ChatGPT Desktop App and other MCP-compatible clients to interact with the Famulor platform.

## Tools

### Call Tools
- `make_call` - Make a call with an AI assistant
- `get_call` - Get details of a call
- `list_calls` - List all calls

### Assistant Tools
- `get_assistants` - Get all assistants
- `get_assistant_details` - Get details of an assistant

## Resources

- [Famulor Voice Agent Platform](https://app.famulor.io)
- [Famulor API Documentation](https://docs.famulor.io/api-reference/)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [ChatGPT Desktop App](https://chatgpt.com/download)

## License

MIT


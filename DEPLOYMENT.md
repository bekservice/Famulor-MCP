# 🚀 Deployment Guide for Famulor MCP Server

This guide explains how to deploy the Famulor MCP Server for use with any MCP-compatible client (ChatGPT Desktop, Claude Desktop, etc.).

## Overview

The Famulor MCP Server is designed to run locally with MCP-compatible clients via stdio transport. It connects directly to your MCP client and does not require HTTP deployment.

## Local Deployment (Recommended)

The MCP Server is intended to run locally on your machine and connect to your MCP client through stdio.

### Prerequisites

- Node.js >= 20.0.0
- An MCP-compatible client installed (ChatGPT Desktop, Claude Desktop, etc.)
- Famulor API key

### Setup Steps

1. **Build the server:**
   ```bash
   npm run build
   ```

2. **Configure MCP in your client:**
   
   Create or edit the MCP configuration file for your client:
   
   **For ChatGPT Desktop App:**
   - macOS: `~/Library/Application Support/ChatGPT/mcp.json`
   - Windows: `%APPDATA%\ChatGPT\mcp.json`
   - Linux: `~/.config/ChatGPT/mcp.json`
   
   **For Claude Desktop App:**
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`
   - Linux: `~/.config/Claude/claude_desktop_config.json`

3. **Add configuration:**
   ```json
   {
     "mcpServers": {
       "famulor": {
         "command": "node",
         "args": ["/absolute/path/to/famulor-mcp/dist/index.js"],
         "env": {
           "FAMULOR_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

4. **Restart your MCP client**

   The MCP server will be automatically started by your MCP client when needed.

## Development Mode

For development with hot reload:

```bash
npm run dev
```

Note: In development mode, you'll need to manually configure the path to `src/index.ts` or use `tsx` in the MCP config.

## Testing

Test the server manually:

```bash
npm run build
node dist/index.js
```

The server will output "Famulor MCP Server running on stdio" to stderr when ready.

## Troubleshooting

### Server Not Starting
- Check Node.js version: `node --version` (must be >= 20.0.0)
- Verify build succeeded: `npm run build`
- Check file permissions on `dist/index.js`

### MCP Server Not Recognized
- Verify the path in your MCP config file is absolute and correct
- Check JSON syntax in your config file
- Restart your MCP client completely

### API Key Issues
- Ensure `FAMULOR_API_KEY` is set in `mcp.json` or as environment variable
- Verify API key is valid at [Famulor API Keys](https://app.famulor.de/api-keys)

## Security Notes

- ✅ API keys are stored locally in your MCP config file (encrypted by your MCP client)
- ✅ Each user configures their own API key
- ✅ No API keys are sent over the network (stdio is local)
- ❌ Do not commit your MCP config file with API keys to version control

## Resources

- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [ChatGPT Desktop App](https://chatgpt.com/download)
- [Claude Desktop App](https://claude.ai/download)
- [Famulor Voice Agent Platform](https://app.famulor.de)
- [Famulor API Documentation](https://docs.famulor.io/api-reference/)

# 🚀 MCP Server Setup for Famulor Voice Agent Platform

This guide explains how to set up and run the Famulor MCP Server for use with ChatGPT Desktop App and other MCP-compatible clients.

## Where can I run the MCP server?

There are several ways to run the MCP server:

## 1. Local Development (with ChatGPT Desktop App)

### Prerequisites
- ChatGPT Desktop App installed
- Node.js >= 20.0.0

### Setup

1. **Create MCP Configuration**

   The ChatGPT Desktop App uses an MCP configuration file. Create or edit:

   **macOS:**
   ```
   ~/Library/Application Support/ChatGPT/mcp.json
   ```

   **Windows:**
   ```
   %APPDATA%\ChatGPT\mcp.json
   ```

   **Linux:**
   ```
   ~/.config/ChatGPT/mcp.json
   ```

2. **Add Configuration:**

```json
{
  "mcpServers": {
    "famulor": {
      "command": "node",
      "args": [
        "/path/to/famulor-mcp/dist/index.js"
      ],
      "env": {
        "FAMULOR_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**IMPORTANT:** Adjust the path to `dist/index.js` for your system!

3. **Build Server:**
```bash
cd famulor-mcp
npm run build
```

4. **Restart ChatGPT Desktop App**

   After restarting, the MCP server should be automatically connected.

## 2. Local Development

For development, you can run the server directly:

### Option A: With tsx (Development with Hot Reload)

```bash
cd famulor-mcp
npm run dev
```

### Option B: With Node (Production Build)

```bash
cd famulor-mcp
npm run build
npm start
```

The server runs on stdio and waits for MCP requests from the ChatGPT Desktop App.

## Troubleshooting

### Server Won't Start
- Check if Node.js >= 20.0.0 is installed: `node --version`
- Check if the build was successful: `npm run build`
- Check logs for error messages

### MCP Server Not Recognized
- Check the MCP configuration file for syntax errors
- Make sure the path to `dist/index.js` is correct
- Restart ChatGPT Desktop App

### API Key Error
- Make sure the API key is set in the configuration
- Check if the API key is valid

## Next Steps

1. ✅ Test server locally
2. ✅ Create MCP configuration
3. ✅ Connect with ChatGPT Desktop App
4. ✅ Test tools
5. ✅ Deploy for production

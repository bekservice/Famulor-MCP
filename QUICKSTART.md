# ⚡ Quick Start - Start MCP Server Locally

## For macOS with ChatGPT Desktop App

### Step 1: Build Server

```bash
cd /path/to/famulor-mcp
npm run build
```

### Step 2: Create MCP Configuration

Create or edit the MCP configuration file:

```bash
mkdir -p ~/Library/Application\ Support/ChatGPT
nano ~/Library/Application\ Support/ChatGPT/mcp.json
```

Add the following configuration (adjust the path):

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

**IMPORTANT:** 
- Replace `your-api-key-here` with your actual API key
- Make sure the path to `dist/index.js` is correct

### Step 3: Restart ChatGPT Desktop App

1. Close the ChatGPT Desktop App completely
2. Restart it
3. The MCP server should be automatically connected

### Step 4: Test

In ChatGPT you can now ask:
- "Show me my Famulor assistants"
- "List my recent calls"
- "Make a call with Assistant X to number Y"

## Alternative: With Environment Variable

You can also set the API key as an environment variable:

```bash
export FAMULOR_API_KEY="your-api-key-here"
cd /path/to/famulor-mcp
npm start
```

Then remove the `env` section from `mcp.json`:

```json
{
  "mcpServers": {
    "famulor": {
      "command": "node",
      "args": [
        "/path/to/famulor-mcp/dist/index.js"
      ]
    }
  }
}
```

## Troubleshooting

### Server Not Found
```bash
# Check if the build was successful
ls -la /path/to/famulor-mcp/dist/index.js

# Check the MCP configuration
cat ~/Library/Application\ Support/ChatGPT/mcp.json
```

### API Key Error
- Make sure the API key is set in `mcp.json` or as an environment variable
- Check if the API key is valid

### View Logs
The server outputs logs to stderr. You can see them if you start the server manually:

```bash
cd /path/to/famulor-mcp
node dist/index.js
```

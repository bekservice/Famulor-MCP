# 🤖 Famulor MCP Server

An MCP (Model Context Protocol) server for the **Famulor Voice Agent Platform** that enables AI-powered phone calls, assistant management, and call data retrieval through ChatGPT and other MCP-compatible clients.

[![GitHub](https://img.shields.io/badge/GitHub-bekservice/Famulor--MCP-blue)](https://github.com/bekservice/Famulor-MCP)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Overview

This MCP server provides access to the Famulor Voice Agent Platform, allowing users to make AI-powered phone calls, manage voice assistants, and retrieve call transcripts and recordings - all directly from any MCP-compatible client like ChatGPT Desktop, Claude Desktop, or other MCP-compatible applications.

## Features

- 📞 **Make Calls** - Initiate AI-powered phone conversations
- 🤖 **Manage Assistants** - Get and manage your AI assistants
- 📊 **Retrieve Call Data** - Get transcripts, recordings, and metadata
- 🔒 **Secure Authentication** - API key-based authentication per user

## Prerequisites

- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))
- **An MCP-compatible client** such as:
  - ChatGPT Desktop App ([Download](https://chatgpt.com/download))
  - Claude Desktop App ([Download](https://claude.ai/download))
  - Any other MCP-compatible client
- A **Famulor API key** ([Get one here](https://app.famulor.de/api-keys))

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/bekservice/Famulor-MCP.git
cd Famulor-MCP
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Build the Server

```bash
npm run build
```

### 4. Get Your API Key

1. Go to [Famulor API Keys](https://app.famulor.de/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the API key (you'll need it in the next step)

### 5. Configure MCP in Your Client

Create or edit the MCP configuration file for your platform and client:

**For ChatGPT Desktop App:**

#### macOS
```bash
mkdir -p ~/Library/Application\ Support/ChatGPT
nano ~/Library/Application\ Support/ChatGPT/mcp.json
```

#### Windows
```bash
# Create/edit: %APPDATA%\ChatGPT\mcp.json
# Or navigate to: C:\Users\YourUsername\AppData\Roaming\ChatGPT\mcp.json
```

#### Linux
```bash
mkdir -p ~/.config/ChatGPT
nano ~/.config/ChatGPT/mcp.json
```

**For Claude Desktop App:**

#### macOS
```bash
mkdir -p ~/Library/Application\ Support/Claude
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

#### Windows
```
%APPDATA%\Claude\claude_desktop_config.json
```

#### Linux
```bash
mkdir -p ~/.config/Claude
nano ~/.config/Claude/claude_desktop_config.json
```

**Note:** For Claude Desktop, add the MCP server configuration to the `mcpServers` section in `claude_desktop_config.json`. The structure is the same as shown below.

Add the following configuration (replace the path with your actual path):

```json
{
  "mcpServers": {
    "famulor": {
      "command": "node",
      "args": [
        "/absolute/path/to/Famulor-MCP/dist/index.js"
      ],
      "env": {
        "FAMULOR_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Important:**
- Replace `/absolute/path/to/Famulor-MCP` with the actual absolute path to your cloned repository
- Replace `your-api-key-here` with your actual Famulor API key
- On Windows, use forward slashes or escaped backslashes in the path

**Example paths:**
- macOS: `/Users/username/Famulor-MCP/dist/index.js`
- Windows: `C:/Users/username/Famulor-MCP/dist/index.js` or `C:\\Users\\username\\Famulor-MCP\\dist\\index.js`
- Linux: `/home/username/Famulor-MCP/dist/index.js`

### 6. Restart Your MCP Client

1. Close your MCP client (ChatGPT Desktop, Claude Desktop, etc.) completely
2. Restart it
3. The MCP server should be automatically connected

### 7. Test It!

In your MCP client (ChatGPT, Claude, etc.), try asking:
- "Show me my Famulor assistants"
- "List my recent calls"
- "Make a call with assistant [ID] to [phone number]"

## Alternative: Using Environment Variable

Instead of putting the API key in `mcp.json`, you can use an environment variable:

1. Set the environment variable:
   ```bash
   export FAMULOR_API_KEY="your-api-key-here"  # macOS/Linux
   # or
   set FAMULOR_API_KEY=your-api-key-here        # Windows CMD
   # or
   $env:FAMULOR_API_KEY="your-api-key-here"     # Windows PowerShell
   ```

2. Remove the `env` section from `mcp.json`:
   ```json
   {
     "mcpServers": {
       "famulor": {
         "command": "node",
         "args": [
           "/absolute/path/to/Famulor-MCP/dist/index.js"
         ]
       }
     }
   }
   ```

## Development

```bash
# Development with Hot Reload
npm run dev

# Build for Production
npm run build

# Start Production Build
npm start

# Lint Code
npm run lint

# Format Code
npm run format
```

## Available Tools

### Call Tools
- **`make_call`** - Make a phone call with an AI assistant
  - Parameters: `assistant_id`, `phone_number`, `variables` (optional)
- **`get_call`** - Get details of a specific call
  - Parameters: `call_id`
- **`list_calls`** - List all calls with optional filters
  - Parameters: `assistant_id` (optional), `limit` (optional)

### Assistant Tools
- **`get_assistants`** - Get all available AI assistants
- **`get_assistant_details`** - Get detailed information about a specific assistant
  - Parameters: `assistant_id`

## Project Structure

```
Famulor-MCP/
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
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
├── README.md
├── QUICKSTART.md         # Quick start guide
├── MCP_SETUP.md          # Detailed setup guide
├── DEPLOYMENT.md          # Deployment guide
└── ONLINE_DEPLOYMENT.md   # Online deployment guide
```

## Troubleshooting

### Server Not Found
- Verify the build was successful: `npm run build`
- Check that `dist/index.js` exists
- Verify the path in `mcp.json` is correct and absolute
- On Windows, ensure you're using forward slashes or properly escaped backslashes

### API Key Error
- Make sure the API key is set in `mcp.json` or as an environment variable
- Verify the API key is valid at [Famulor API Keys](https://app.famulor.de/api-keys)
- Check that the API key hasn't expired

### MCP Server Not Recognized
- Check the JSON syntax in your MCP config file (use a JSON validator)
- Ensure the path to `dist/index.js` is absolute
- Restart your MCP client completely (ChatGPT Desktop, Claude Desktop, etc.)
- Check your client's logs for error messages

### Node.js Version Issues
- Verify Node.js version: `node --version` (must be >= 20.0.0)
- Update Node.js if needed: [Download Node.js](https://nodejs.org/)

## About MCP

This is a **Model Context Protocol (MCP) Server** that provides access to the Famulor Voice Agent Platform. MCP is a protocol that allows AI assistants like ChatGPT, Claude, and other AI tools to securely connect to external data sources and tools.

The server exposes Famulor's voice agent capabilities as MCP tools, enabling any MCP-compatible client (ChatGPT Desktop, Claude Desktop, or other MCP applications) to interact with the Famulor platform.

## Security

- ✅ Each user configures their own API key
- ✅ API keys are stored locally in your MCP config file (encrypted by your MCP client)
- ✅ No API keys are sent over the network (stdio is local)
- ❌ **Never commit your MCP config file with API keys to version control**
- ❌ **Never share your API key publicly**

## Resources

- [Famulor Voice Agent Homepage](https://www.famulor.io)
- [Famulor Voice Agent Platform](https://app.famulor.de)
- [Famulor API Documentation](https://docs.famulor.io/api-reference/)
- [MCP Protocol Documentation](https://modelcontextprotocol.io/)
- [ChatGPT Desktop App](https://chatgpt.com/download)
- [Claude Desktop App](https://claude.ai/download)
- [GitHub Repository](https://github.com/bekservice/Famulor-MCP)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Author

[bekservice](https://github.com/bekservice)

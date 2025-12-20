# 🤖 Famulor MCP Server

An MCP (Model Context Protocol) server for the **Famulor Voice Agent Platform** that enables AI-powered phone calls, assistant management, and call data retrieval through ChatGPT and other MCP-compatible clients.

[![GitHub](https://img.shields.io/badge/GitHub-bekservice/Famulor--MCP-blue)](https://github.com/bekservice/Famulor-MCP)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## Overview

This MCP server provides access to the Famulor Voice Agent Platform, allowing users to make AI-powered phone calls, manage voice assistants, and retrieve call transcripts and recordings - all directly from any MCP-compatible client like ChatGPT Desktop, Claude Desktop, or other MCP-compatible applications.

### 🌐 Online MCP Server

**You can use the hosted MCP server without local installation:**

- **Server URL**: [https://mcp.famulor.io](https://mcp.famulor.io)
- **SSE Endpoint**: [https://mcp.famulor.io/sse](https://mcp.famulor.io/sse)
- **Health Check**: [https://mcp.famulor.io/health](https://mcp.famulor.io/health)

The server is ready to use! For online usage instructions, see the [Online Deployment Guide](ONLINE_DEPLOYMENT.md).

## Features

- 📞 **Make Calls** - Initiate AI-powered phone conversations
- 🤖 **Manage Assistants** - Get and manage your AI assistants
- 📊 **Retrieve Call Data** - Get transcripts, recordings, and metadata
- 🔒 **Secure Authentication** - API key-based authentication per user

## Prerequisites

- **An MCP-compatible client** such as:
  - ChatGPT Desktop App ([Download](https://chatgpt.com/download))
  - Claude Desktop App ([Download](https://claude.ai/download))
  - Cursor IDE
  - Any other MCP-compatible client
- A **Famulor API key** ([Get one here](https://app.famulor.de/api-keys))

**Note:** If you want to run your own local server (Option 2), you'll also need:
- **Node.js** >= 20.0.0 ([Download](https://nodejs.org/))

## Quick Start

### Option 1: Use Online MCP Server (Recommended - No Installation Required)

**The easiest way to get started!** Use our hosted MCP server at [https://mcp.famulor.io](https://mcp.famulor.io).

#### 1. Get Your API Key

1. Go to [Famulor API Keys](https://app.famulor.de/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the API key (you'll need it in the next step)

#### 2. Configure MCP in Your Client

See the [Client-Specific Installation](#client-specific-installation) section below for detailed instructions for your MCP client (Cursor, Claude Desktop, ChatGPT Desktop, etc.).

**Quick Example Configuration:**

```json
{
  "mcpServers": {
    "famulor": {
      "url": "https://mcp.famulor.io/sse",
      "env": {
        "FAMULOR_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

#### 3. Restart Your MCP Client

1. Close your MCP client completely
2. Restart it
3. The MCP server should be automatically connected

#### 4. Test It!

In your MCP client (ChatGPT, Claude, etc.), try asking:
- "Show me my Famulor assistants"
- "List my recent calls"
- "Make a call with assistant [ID] to [phone number]"

---

### Option 2: Use Your Own Local Server

If you prefer to run the server locally:

#### 1. Clone the Repository

```bash
git clone https://github.com/bekservice/Famulor-MCP.git
cd Famulor-MCP
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Build the Server

```bash
npm run build
```

#### 4. Get Your API Key

1. Go to [Famulor API Keys](https://app.famulor.de/api-keys)
2. Sign in or create an account
3. Create a new API key
4. Copy the API key (you'll need it in the next step)

#### 5. Configure MCP in Your Client

Create or edit the MCP configuration file for your platform and client. See the [Client-Specific Installation](#client-specific-installation) section below for detailed instructions.

**Example Configuration:**

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

#### 6. Restart Your MCP Client

1. Close your MCP client (ChatGPT Desktop, Claude Desktop, etc.) completely
2. Restart it
3. The MCP server should be automatically connected

#### 7. Test It!

In your MCP client (ChatGPT, Claude, etc.), try asking:
- "Show me my Famulor assistants"
- "List my recent calls"
- "Make a call with assistant [ID] to [phone number]"

## Client-Specific Installation

Choose your MCP client below for specific installation instructions:

### For Claude Desktop

#### Option 1: Use Online MCP Server (Recommended - No Installation Required)

1. **Find your configuration file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add the online MCP server configuration:**

   Open the configuration file and add the following to the `mcpServers` section:

   ```json
   {
     "mcpServers": {
       "famulor": {
         "type": "http",
         "url": "https://mcp.famulor.io/sse",
         "headers": {
           "Authorization": "Bearer your-api-key-here"
         }
       }
     }
   }
   ```

   **Important:**
   - Replace `your-api-key-here` with your actual Famulor API key
   - The API key must be prefixed with `Bearer ` in the Authorization header
   - You can get your API key at [Famulor API Keys](https://app.famulor.de/api-keys)

3. **Restart Claude Desktop** for the changes to take effect.

#### Option 2: Use Your Own Local Server

1. **Find your configuration file:**
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
   - **Linux**: `~/.config/Claude/claude_desktop_config.json`

2. **Add the MCP server configuration:**

   Open the configuration file and add the following to the `mcpServers` section:

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

3. **Restart Claude Desktop** for the changes to take effect.

### For Cursor

#### Option 1: Use Online MCP Server (Recommended - No Installation Required)

**Global Installation (Recommended):**

1. Go to **Cursor Settings** > **Tools & Integrations**
2. Click **"New MCP Server"**
3. This will open `~/.cursor/mcp.json`
4. Add the following configuration:

   ```json
   {
     "mcpServers": {
       "famulor": {
         "type": "http",
         "url": "https://mcp.famulor.io/sse",
         "headers": {
           "Authorization": "Bearer your-api-key-here"
         }
       }
     }
   }
   ```

   **Important:**
   - Replace `your-api-key-here` with your actual Famulor API key
   - The API key must be prefixed with `Bearer ` in the Authorization header
   - You can get your API key at [Famulor API Keys](https://app.famulor.de/api-keys)

5. Go back to **Settings** > **MCP** and click the **refresh** button
6. The Cursor agent will now be able to use the Famulor MCP tools

**Project-Specific Installation:**

1. Create or edit `.cursor/mcp.json` in your project root
2. Add the same configuration as above
3. Restart Cursor or refresh MCP settings

#### Option 2: Use Your Own Local Server

**Global Installation (Recommended):**

1. Go to **Cursor Settings** > **Tools & Integrations**
2. Click **"New MCP Server"**
3. This will open `~/.cursor/mcp.json`
4. Add the following configuration:

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

5. Go back to **Settings** > **MCP** and click the **refresh** button
6. The Cursor agent will now be able to use the Famulor MCP tools

**Project-Specific Installation:**

1. Create or edit `.cursor/mcp.json` in your project root
2. Add the same configuration as above
3. Restart Cursor or refresh MCP settings

### For Claude Code

#### Option 1: Use Online MCP Server (Recommended - No Installation Required)

To add the online MCP server to Claude Code, run this command in your terminal:

```bash
claude mcp add-json "famulor" '{"type":"http","url":"https://mcp.famulor.io/sse","headers":{"Authorization":"Bearer your-api-key-here"}}'
```

**Note:** 
- Replace `your-api-key-here` with your actual Famulor API key
- The API key must be prefixed with `Bearer ` in the Authorization header
- You can get your API key at [Famulor API Keys](https://app.famulor.de/api-keys)

#### Option 2: Use Your Own Local Server

To add your local MCP server to Claude Code, run this command in your terminal:

```bash
claude mcp add-json "famulor" '{"command":"node","args":["/absolute/path/to/Famulor-MCP/dist/index.js"],"env":{"FAMULOR_API_KEY":"your-api-key-here"}}'
```

**Note:** Replace `/absolute/path/to/Famulor-MCP/dist/index.js` with your actual path and `your-api-key-here` with your actual API key.

See the [official Claude Code MCP documentation](https://docs.anthropic.com/claude/docs/mcp) for more details.

### For ChatGPT Desktop App

#### Option 1: Use Online MCP Server (Recommended - No Installation Required)

1. **Find your configuration file:**
   - **macOS**: `~/Library/Application Support/ChatGPT/mcp.json`
   - **Windows**: `%APPDATA%\ChatGPT\mcp.json` or `C:\Users\YourUsername\AppData\Roaming\ChatGPT\mcp.json`
   - **Linux**: `~/.config/ChatGPT/mcp.json`

2. **Add the online MCP server configuration:**

   ```json
   {
     "mcpServers": {
       "famulor": {
         "url": "https://mcp.famulor.io/sse",
         "env": {
           "FAMULOR_API_KEY": "your-api-key-here"
         }
       }
     }
   }
   ```

3. **Restart ChatGPT Desktop App** for the changes to take effect.

#### Option 2: Use Your Own Local Server

1. **Find your configuration file:**
   - **macOS**: `~/Library/Application Support/ChatGPT/mcp.json`
   - **Windows**: `%APPDATA%\ChatGPT\mcp.json` or `C:\Users\YourUsername\AppData\Roaming\ChatGPT\mcp.json`
   - **Linux**: `~/.config/ChatGPT/mcp.json`

2. **Add the MCP server configuration:**

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

3. **Restart ChatGPT Desktop App** for the changes to take effect.

## Alternative: Using the Online MCP Server

**No local installation required!** You can use the hosted MCP server at [https://mcp.famulor.io](https://mcp.famulor.io).

### For OpenAI App Store / ChatGPT Web

1. Register your app in the [OpenAI Developer Portal](https://platform.openai.com)
2. Configure the MCP Server URL: `https://mcp.famulor.io/sse`
3. Users will enter their own Famulor API key through the ChatGPT/Claude UI
4. Each user's API key is securely stored and used per-request

See [ONLINE_DEPLOYMENT.md](ONLINE_DEPLOYMENT.md) for detailed instructions.

### For MCP Clients with HTTP/SSE Support

Some MCP clients support HTTP/SSE connections. Configure your client to connect to:
- **URL**: `https://mcp.famulor.io/sse`
- **API Key**: Enter your Famulor API key in the client's configuration

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

- 🌐 **Online MCP Server**: [https://mcp.famulor.io](https://mcp.famulor.io)
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

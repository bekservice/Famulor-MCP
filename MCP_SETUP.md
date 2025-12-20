# 🚀 MCP Server Setup Guide

This comprehensive guide explains how to set up and run the Famulor MCP Server for use with any MCP-compatible client, including ChatGPT Desktop App, Claude Desktop App, and other MCP-compatible applications.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Methods](#installation-methods)
3. [Configuration](#configuration)
4. [Platform-Specific Instructions](#platform-specific-instructions)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Configuration](#advanced-configuration)

## Prerequisites

### Required Software

- **Node.js** >= 20.0.0
  - Check version: `node --version`
  - Download: [nodejs.org](https://nodejs.org/)
  
- **An MCP-compatible client** such as:
  - ChatGPT Desktop App ([Download](https://chatgpt.com/download))
  - Claude Desktop App ([Download](https://claude.ai/download))
  - Any other MCP-compatible client

- **Famulor API Key**
  - Get one at: [app.famulor.de/api-keys](https://app.famulor.de/api-keys)

### Verify Prerequisites

```bash
# Check Node.js version
node --version  # Should be v20.0.0 or higher

# Check npm version
npm --version

# Verify your MCP client is installed
# (Check your Applications folder or Start menu)
```

## Installation Methods

### Method 1: Git Clone (Recommended)

```bash
# Clone the repository
git clone https://github.com/bekservice/Famulor-MCP.git

# Navigate to the directory
cd Famulor-MCP

# Install dependencies
npm install

# Build the server
npm run build
```

### Method 2: Download ZIP

1. Download the repository as ZIP from [GitHub](https://github.com/bekservice/Famulor-MCP)
2. Extract the ZIP file
3. Open terminal/command prompt in the extracted folder
4. Run:
   ```bash
   npm install
   npm run build
   ```

## Configuration

### MCP Configuration File Locations

The MCP configuration file location depends on your operating system and client:

#### For ChatGPT Desktop App

| Platform | Path |
|----------|------|
| **macOS** | `~/Library/Application Support/ChatGPT/mcp.json` |
| **Windows** | `%APPDATA%\ChatGPT\mcp.json` or `C:\Users\YourUsername\AppData\Roaming\ChatGPT\mcp.json` |
| **Linux** | `~/.config/ChatGPT/mcp.json` |

#### For Claude Desktop App

| Platform | Path |
|----------|------|
| **macOS** | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| **Windows** | `%APPDATA%\Claude\claude_desktop_config.json` |
| **Linux** | `~/.config/Claude/claude_desktop_config.json` |

**Note:** For Claude Desktop, add the MCP server configuration to the `mcpServers` section in `claude_desktop_config.json`. The structure is the same as shown in the configuration examples below.

### Basic Configuration

Create the `mcp.json` file with the following structure:

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

### Configuration Options

#### Option 1: API Key in Config File

```json
{
  "mcpServers": {
    "famulor": {
      "command": "node",
      "args": ["/path/to/Famulor-MCP/dist/index.js"],
      "env": {
        "FAMULOR_API_KEY": "your-api-key-here"
      }
    }
  }
}
```

**Pros:**
- Simple setup
- Works immediately after restart

**Cons:**
- API key stored in plain text (but encrypted by your MCP client)

#### Option 2: API Key as Environment Variable

```json
{
  "mcpServers": {
    "famulor": {
      "command": "node",
      "args": ["/path/to/Famulor-MCP/dist/index.js"]
    }
  }
}
```

Set the environment variable:

**macOS/Linux:**
```bash
export FAMULOR_API_KEY="your-api-key-here"
```

**Windows PowerShell:**
```powershell
$env:FAMULOR_API_KEY = "your-api-key-here"
```

**Windows CMD:**
```cmd
set FAMULOR_API_KEY=your-api-key-here
```

**Pros:**
- API key not in config file
- Can be managed separately

**Cons:**
- Must be set in each terminal session (unless added to shell profile)

## Platform-Specific Instructions

### macOS

1. **Create configuration directory:**
   ```bash
   mkdir -p ~/Library/Application\ Support/ChatGPT
   ```

2. **Create/edit configuration file:**
   ```bash
   nano ~/Library/Application\ Support/ChatGPT/mcp.json
   ```

3. **Add configuration** (see [Configuration](#configuration) above)

4. **Get absolute path:**
   ```bash
   cd /path/to/Famulor-MCP
   pwd
   # Use this path in mcp.json
   ```

5. **Restart your MCP client** (ChatGPT Desktop, Claude Desktop, etc.)

### Windows

1. **Create configuration directory:**
   ```powershell
   New-Item -ItemType Directory -Force -Path "$env:APPDATA\ChatGPT"
   ```

2. **Create/edit configuration file:**
   ```powershell
   notepad "$env:APPDATA\ChatGPT\mcp.json"
   ```

3. **Add configuration** (see [Configuration](#configuration) above)

4. **Get absolute path:**
   ```powershell
   cd C:\path\to\Famulor-MCP
   pwd
   # Use this path in mcp.json (use forward slashes: C:/path/to/Famulor-MCP/dist/index.js)
   ```

5. **Important for Windows:**
   - Use forward slashes (`/`) or escaped backslashes (`\\`) in paths
   - Example: `C:/Users/John/Famulor-MCP/dist/index.js`

6. **Restart your MCP client** (ChatGPT Desktop, Claude Desktop, etc.)

### Linux

1. **Create configuration directory:**
   ```bash
   mkdir -p ~/.config/ChatGPT
   ```

2. **Create/edit configuration file:**
   ```bash
   nano ~/.config/ChatGPT/mcp.json
   ```

3. **Add configuration** (see [Configuration](#configuration) above)

4. **Get absolute path:**
   ```bash
   cd /path/to/Famulor-MCP
   pwd
   # Use this path in mcp.json
   ```

5. **Restart your MCP client** (ChatGPT Desktop, Claude Desktop, etc.)

## Troubleshooting

### Server Won't Start

**Symptoms:**
- Your MCP client shows "MCP server not found"
- Error messages about the server

**Solutions:**

1. **Check Node.js version:**
   ```bash
   node --version  # Must be >= 20.0.0
   ```

2. **Verify build:**
   ```bash
   cd Famulor-MCP
   npm run build
   ls dist/index.js  # Should exist
   ```

3. **Check file permissions:**
   ```bash
   # macOS/Linux
   chmod +x dist/index.js
   ```

4. **Test server manually:**
   ```bash
   node dist/index.js
   # Should not error immediately
   ```

### MCP Server Not Recognized

**Symptoms:**
- Server doesn't appear in your MCP client
- No tools available

**Solutions:**

1. **Check JSON syntax:**
   - Use [jsonlint.com](https://jsonlint.com/) to validate
   - Ensure no trailing commas
   - All strings in double quotes

2. **Verify path:**
   - Must be absolute path
   - No `~` or relative paths
   - File must exist at that path

3. **Check your MCP client logs:**
   - Look for error messages
   - Check console output

4. **Restart completely:**
   - Quit your MCP client (not just close window)
   - Wait a few seconds
   - Restart

### API Key Error

**Symptoms:**
- "API key not configured" error
- "Authentication failed" error

**Solutions:**

1. **Verify API key:**
   - Go to [app.famulor.de/api-keys](https://app.famulor.de/api-keys)
   - Check if key is valid
   - Create new key if needed

2. **Check configuration:**
   - API key in quotes: `"FAMULOR_API_KEY": "key-here"`
   - No extra spaces
   - Correct environment variable name

3. **Test API key:**
   ```bash
   export FAMULOR_API_KEY="your-key"
   node -e "console.log(process.env.FAMULOR_API_KEY)"
   ```

### Path Issues (Windows)

**Symptoms:**
- "File not found" errors
- Server won't start

**Solutions:**

1. **Use forward slashes:**
   ```json
   "args": ["C:/Users/John/Famulor-MCP/dist/index.js"]
   ```

2. **Or escape backslashes:**
   ```json
   "args": ["C:\\\\Users\\\\John\\\\Famulor-MCP\\\\dist\\\\index.js"]
   ```

3. **Get exact path:**
   ```powershell
   (Get-Item "C:\path\to\Famulor-MCP\dist\index.js").FullName
   ```

## Advanced Configuration

### Multiple MCP Servers

You can configure multiple MCP servers in the same `mcp.json`:

```json
{
  "mcpServers": {
    "famulor": {
      "command": "node",
      "args": ["/path/to/Famulor-MCP/dist/index.js"],
      "env": {
        "FAMULOR_API_KEY": "your-key"
      }
    },
    "another-server": {
      "command": "node",
      "args": ["/path/to/another-server/dist/index.js"]
    }
  }
}
```

### Development Mode

For development with hot reload:

1. Install `tsx` globally (if not already):
   ```bash
   npm install -g tsx
   ```

2. Update `mcp.json`:
   ```json
   {
     "mcpServers": {
       "famulor": {
         "command": "tsx",
         "args": ["/path/to/Famulor-MCP/src/index.ts"],
         "env": {
           "FAMULOR_API_KEY": "your-key"
         }
       }
     }
   }
   ```

### Custom Base URL

If you need to use a custom API endpoint, you can modify the `FamulorClient` constructor in `src/auth/famulor.ts` or pass it as a parameter.

## Next Steps

1. ✅ Verify the server is working
2. ✅ Test the available tools
3. ✅ Read the [README](README.md) for more information
4. ✅ Check [DEPLOYMENT.md](DEPLOYMENT.md) for deployment options
5. ✅ Explore [ONLINE_DEPLOYMENT.md](ONLINE_DEPLOYMENT.md) for online deployment

## Getting Help

- 📖 Read the [README](README.md)
- ⚡ Check the [Quick Start Guide](QUICKSTART.md)
- 🐛 [Open an issue](https://github.com/bekservice/Famulor-MCP/issues) on GitHub
- 📚 Visit [Famulor Documentation](https://docs.famulor.io)

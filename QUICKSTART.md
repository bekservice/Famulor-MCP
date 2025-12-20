# ⚡ Quick Start Guide

This guide will help you get the Famulor MCP Server up and running with any MCP-compatible client (ChatGPT Desktop, Claude Desktop, etc.) in just a few minutes.

## Prerequisites

Before you begin, make sure you have:
- ✅ Node.js >= 20.0.0 installed ([Download](https://nodejs.org/))
- ✅ An MCP-compatible client installed:
  - ChatGPT Desktop App ([Download](https://chatgpt.com/download))
  - Claude Desktop App ([Download](https://claude.ai/download))
  - Or any other MCP-compatible client
- ✅ A Famulor account and API key ([Get one here](https://app.famulor.de/api-keys))

## Step-by-Step Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/bekservice/Famulor-MCP.git
cd Famulor-MCP

# Install dependencies
npm install
```

### Step 2: Build the Server

```bash
npm run build
```

This creates the `dist/` folder with the compiled JavaScript files.

### Step 3: Get Your API Key

1. Go to [https://app.famulor.de/api-keys](https://app.famulor.de/api-keys)
2. Sign in to your Famulor account
3. Click "Create API Key" or use an existing one
4. Copy the API key (you'll need it in the next step)

### Step 4: Configure MCP

Create the MCP configuration file for your operating system and client:

#### For ChatGPT Desktop App

**macOS:**
```bash
mkdir -p ~/Library/Application\ Support/ChatGPT
nano ~/Library/Application\ Support/ChatGPT/mcp.json
```

**Windows:**
```
C:\Users\YourUsername\AppData\Roaming\ChatGPT\mcp.json
```

Or use PowerShell:
```powershell
New-Item -ItemType Directory -Force -Path "$env:APPDATA\ChatGPT"
notepad "$env:APPDATA\ChatGPT\mcp.json"
```

**Linux:**
```bash
mkdir -p ~/.config/ChatGPT
nano ~/.config/ChatGPT/mcp.json
```

#### For Claude Desktop App

**macOS:**
```bash
mkdir -p ~/Library/Application\ Support/Claude
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```
C:\Users\YourUsername\AppData\Roaming\Claude\claude_desktop_config.json
```

**Linux:**
```bash
mkdir -p ~/.config/Claude
nano ~/.config/Claude/claude_desktop_config.json
```

**Note:** For Claude Desktop, the configuration structure is the same, but the file is named `claude_desktop_config.json` and should contain an `mcpServers` section.

### Step 5: Add Configuration

Add the following JSON to your `mcp.json` file. **Important:** Replace the placeholders!

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

**Replace:**
1. `/absolute/path/to/Famulor-MCP` with your actual absolute path
2. `your-api-key-here` with your actual Famulor API key

**Path Examples:**

- **macOS:** `/Users/john/Famulor-MCP/dist/index.js`
- **Windows:** `C:/Users/john/Famulor-MCP/dist/index.js` (use forward slashes)
- **Linux:** `/home/john/Famulor-MCP/dist/index.js`

**How to find your absolute path:**

- **macOS/Linux:** Run `pwd` in the Famulor-MCP directory
- **Windows:** Run `cd` in PowerShell/CMD in the Famulor-MCP directory

### Step 6: Restart Your MCP Client

1. **Completely close** your MCP client (ChatGPT Desktop, Claude Desktop, etc.) - not just minimize
2. **Restart** the app
3. The MCP server should now be connected automatically

### Step 7: Verify It Works

Open your MCP client (ChatGPT, Claude, etc.) and try these commands:

- "Show me my Famulor assistants"
- "List my recent calls"
- "What assistants do I have available?"

If you see responses, congratulations! 🎉 The MCP server is working!

## Alternative: Using Environment Variable

If you prefer not to store your API key in `mcp.json`, you can use an environment variable:

### macOS/Linux

```bash
# Add to your ~/.zshrc or ~/.bashrc
export FAMULOR_API_KEY="your-api-key-here"

# Then reload your shell
source ~/.zshrc  # or source ~/.bashrc
```

Then remove the `env` section from `mcp.json`:

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

### Windows PowerShell

```powershell
# Set for current session
$env:FAMULOR_API_KEY = "your-api-key-here"

# Or set permanently
[System.Environment]::SetEnvironmentVariable('FAMULOR_API_KEY', 'your-api-key-here', 'User')
```

### Windows CMD

```cmd
setx FAMULOR_API_KEY "your-api-key-here"
```

## Troubleshooting

### "Server not found" or "MCP server not recognized"

1. **Check the path:**
   ```bash
   # Verify the file exists
   ls -la /absolute/path/to/Famulor-MCP/dist/index.js  # macOS/Linux
   dir C:\path\to\Famulor-MCP\dist\index.js            # Windows
   ```

2. **Verify the build:**
   ```bash
   cd Famulor-MCP
   npm run build
   ```

3. **Check JSON syntax:**
   - Use a JSON validator like [jsonlint.com](https://jsonlint.com/)
   - Make sure there are no trailing commas
   - Ensure all strings are in double quotes

4. **Restart your MCP client completely:**
   - Quit the app (not just close the window)
   - Wait a few seconds
   - Restart

### "API key error" or "Authentication failed"

1. **Verify your API key:**
   - Go to [https://app.famulor.de/api-keys](https://app.famulor.de/api-keys)
   - Check if the key is still valid
   - Create a new key if needed

2. **Check the configuration:**
   - Make sure the API key is in quotes: `"FAMULOR_API_KEY": "your-key"`
   - Verify there are no extra spaces or characters

### "Node.js not found"

1. **Check Node.js installation:**
   ```bash
   node --version  # Should show v20.0.0 or higher
   ```

2. **Install or update Node.js:**
   - Download from [nodejs.org](https://nodejs.org/)
   - Make sure to add Node.js to your PATH

### Still having issues?

1. Check the [MCP_SETUP.md](MCP_SETUP.md) for detailed setup instructions
2. Review the [DEPLOYMENT.md](DEPLOYMENT.md) for deployment-specific help
3. Open an issue on [GitHub](https://github.com/bekservice/Famulor-MCP/issues)

## Next Steps

Once everything is working:

1. ✅ Explore the available tools (assistants, calls)
2. ✅ Try making a test call
3. ✅ Check out the [full documentation](README.md)
4. ✅ Read about [online deployment](ONLINE_DEPLOYMENT.md) if you want to deploy this

## Need Help?

- 📖 Read the [full README](README.md)
- 🚀 Check [MCP_SETUP.md](MCP_SETUP.md) for detailed setup
- 🐛 [Open an issue](https://github.com/bekservice/Famulor-MCP/issues) on GitHub
- 📚 Visit [Famulor Documentation](https://docs.famulor.io)

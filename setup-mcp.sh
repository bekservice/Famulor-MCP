#!/bin/bash

# Setup Script for MCP Server on macOS

echo "🚀 Famulor MCP Server Setup"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js >= 20.0.0"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo "❌ Node.js version must be >= 20.0.0. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js Version: $(node -v)"

# Build the server
echo ""
echo "📦 Building the server..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build successful"

# Create MCP configuration directory
MCP_DIR="$HOME/Library/Application Support/ChatGPT"
mkdir -p "$MCP_DIR"

# Current path
CURRENT_DIR=$(pwd)
SERVER_PATH="$CURRENT_DIR/dist/index.js"

echo ""
echo "📝 Creating MCP configuration..."
echo ""

# Check if mcp.json already exists
if [ -f "$MCP_DIR/mcp.json" ]; then
    echo "⚠️  mcp.json already exists. Creating backup..."
    cp "$MCP_DIR/mcp.json" "$MCP_DIR/mcp.json.backup"
fi

# Create new configuration
cat > "$MCP_DIR/mcp.json" << JSON
{
  "mcpServers": {
    "famulor": {
      "command": "node",
      "args": [
        "$SERVER_PATH"
      ],
      "env": {
        "FAMULOR_API_KEY": "SET_YOUR_API_KEY_HERE"
      }
    }
  }
}
JSON

echo "✅ MCP configuration created: $MCP_DIR/mcp.json"
echo ""
echo "⚠️  IMPORTANT: Edit the file and set your API key:"
echo "   nano \"$MCP_DIR/mcp.json\""
echo ""
echo "📋 Next steps:"
echo "   1. Edit mcp.json and set your FAMULOR_API_KEY"
echo "   2. Restart the ChatGPT Desktop App"
echo "   3. The MCP server should be automatically connected"
echo ""

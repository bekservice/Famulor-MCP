# 🌐 Online Deployment for OpenAI App Store

This guide explains how to configure the Famulor app so that **each user enters their own API key**.

## ✅ Important Architecture Principles

### User API Keys (Correct)
- ✅ **Each user** enters their own Famulor API key
- ✅ API keys are **securely stored per-user**
- ✅ Users configure the key through the **ChatGPT/Claude UI**
- ✅ **No** API key from developer required

### Developer API Key (Wrong)
- ❌ Developer should **NOT** use their API key
- ❌ Users should **NOT** see the developer's API key
- ❌ API keys should **NOT** be committed in code

## How does User-Config work?

### 1. User Opens the App

When a user opens the app in ChatGPT/Claude:

1. **First time**: App shows configuration dialog
2. **User enters API key**: Through the UI
3. **API key is stored**: Securely per-user
4. **With each request**: API key is sent along

### 2. Server Processing

```typescript
// The server receives the API key from the user
function getClientFromConfig(server: Server): FamulorClient {
  // 1. Try userConfig (entered by user via UI)
  const userConfig = (server as any).userConfig || {};
  let apiKey = userConfig.famulor_api_key;
  
  // 2. Fallback to config (legacy)
  if (!apiKey) {
    apiKey = (server as any).config?.famulor_api_key;
  }
  
  // 3. Fallback to Environment Variable (development only)
  if (!apiKey) {
    apiKey = process.env.FAMULOR_API_KEY;
  }
  
  // User API key is used
  return new FamulorClient(apiKey);
}
```

### 3. API Requests

Each API request uses the **respective user's API key**:

```typescript
// User A calls make_call → uses API key from User A
// User B calls make_call → uses API key from User B
```

## Deployment Steps

### Step 1: Deploy Server

Deploy the MCP server on a public URL:

```bash
# Example with Fly.io
fly launch
fly deploy
```

The server should be accessible at: `https://your-app.fly.dev`

### Step 2: OpenAI App Store Registration

1. Go to [OpenAI Developer Portal](https://platform.openai.com)
2. Create a new app
3. Configure the MCP Server URL
4. Define the config options:

```json
{
  "config": {
    "famulor_api_key": {
      "type": "string",
      "description": "Your Famulor API key",
      "required": true,
      "secret": true
    }
  }
}
```

### Step 3: User Experience

When a user uses the app:

1. **First time**: ChatGPT/Claude asks for API key
2. **User enters key**: Through secure UI
3. **Key is stored**: Per-user, encrypted
4. **App works**: With the user's API key

## Security

### ✅ Secure
- User API keys are stored encrypted
- Each user only sees their own key
- Keys are not written to logs
- HTTPS for all connections

### ❌ Insecure
- Developer API key in code
- API keys in Git commits
- API keys in logs
- HTTP instead of HTTPS

## Testing

### Test locally (with own key):
```bash
export FAMULOR_API_KEY="your-test-key"
npm start
```

### Test online:
1. Deploy to public URL
2. Open app in ChatGPT
3. Enter your API key
4. Test the tools

## Production Checklist

- [ ] Server deployed on public URL
- [ ] HTTPS enabled
- [ ] No API keys in code
- [ ] Config API implemented
- [ ] User config works
- [ ] App registered in OpenAI Portal
- [ ] Users can enter API key
- [ ] Each user uses their own key

## Support

For questions:
- [OpenAI Apps SDK Docs](https://developers.openai.com/apps-sdk)
- [MCP Protocol](https://modelcontextprotocol.io)
- [Famulor API Docs](https://docs.famulor.io)

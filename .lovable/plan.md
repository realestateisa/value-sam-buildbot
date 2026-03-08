

## Plan: Create an MCP Server Edge Function for VBH Q&A

### What
Replace the planned `ask-sam` webhook with an MCP server edge function (`mcp-sam`) that exposes the VBH chatbot as an MCP tool. Any MCP-compatible client (Claude Desktop, Cursor, etc.) can then call it.

### MCP Server Design

**Edge Function:** `supabase/functions/mcp-sam/index.ts`

Uses `mcp-lite` with Hono for HTTP transport. Exposes one tool:

- **`ask_sam`** - Send a question to the VBH chatbot and get an answer
  - Input: `{ question: string, sessionId?: string }`
  - Output: Answer text with citations and sessionId for conversation continuity

The tool internally calls the CustomGPT API using the existing `CUSTOMGPT_API_KEY` and `CUSTOMGPT_PROJECT_ID` secrets (already configured).

### Files to Create/Modify

1. **Create `supabase/functions/mcp-sam/index.ts`**
   - Hono + mcp-lite MCP server
   - One tool: `ask_sam` wrapping the CustomGPT conversation API
   - Reuses the same logic from `chat-with-sam` (create conversation, send message, fetch citations)

2. **Create `supabase/functions/mcp-sam/deno.json`**
   - Import map for `mcp-lite@^0.10.0` and `hono`

3. **Update `supabase/config.toml`**
   - Add `[functions.mcp-sam]` with `verify_jwt = false`

### Endpoint
```
POST https://bhsnjbisxeuguhggjyzv.supabase.co/functions/v1/mcp-sam
```

### MCP Client Configuration (e.g. Claude Desktop)
```json
{
  "mcpServers": {
    "vbh-sam": {
      "url": "https://bhsnjbisxeuguhggjyzv.supabase.co/functions/v1/mcp-sam"
    }
  }
}
```


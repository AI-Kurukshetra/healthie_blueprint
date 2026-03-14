# Supabase MCP Setup

This project helps you wire Supabase into Model Context Protocol (MCP) clients. You can either connect directly to Supabase's hosted MCP server or deploy the included Edge Function for a self-hosted workflow that runs inside your own project.

## Hosted Supabase MCP (recommended)
Supabase operates a managed MCP server that exposes higher-level helpers such as `execute_sql`, `raw_sql`, `list_tables`, and `get_table_definition`. Configure it with your project reference and a privileged access token (service role or personal access token with database scope).

1. Sign in to the Supabase CLI (`supabase login`) or dashboard and copy your project ref and service role key.
2. Export the credentials for your MCP client:
   ```bash
   export SUPABASE_URL="https://<PROJECT_REF>.supabase.co"
   export SUPABASE_ACCESS_TOKEN="<SUPABASE_SERVICE_ROLE_KEY>"
   ```
3. Add the server to your MCP client. Example for Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`):
   ```json
   {
     "mcpServers": {
       "supabase": {
         "type": "websocket",
         "url": "wss://mcp.supabase.com/mcp",
         "env": {
           "SUPABASE_URL": "https://<PROJECT_REF>.supabase.co",
           "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
         }
       }
     }
   }
   ```
4. Restart your MCP client. The `execute_sql` tool will now proxy queries to your project's database, and complementary tools expose schema metadata, RPC invocation, and EXPLAIN plans.

## Self-hosted Edge Function
The `supabase/functions/mcp` folder contains a deployable Edge Function you can customize for project-specific workflows.

1. Duplicate the sample environment file and fill in your credentials:
   ```bash
   cp .env.example .env
   # edit .env with SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
   ```
2. Run the function locally:
   ```bash
   supabase functions serve mcp \
     --no-verify-jwt \
     --env-file .env
   ```
   The CLI exposes the MCP transport over HTTP/WebSocket on `http://localhost:54321/functions/v1/mcp`.
3. Deploy to Supabase when ready:
   ```bash
   supabase functions deploy mcp --no-verify-jwt
   ```
4. Point your MCP client at the deployed endpoint, for example `wss://<PROJECT_REF>.supabase.co/functions/v1/mcp`, and forward the same environment variables.

### Available tools
- `health_check`: confirms the function can read the necessary environment variables.
- `supabase_select`: wraps PostgREST to read tables with optional filters, limits, and alternate schemas.
- `supabase_rpc`: calls a Postgres function you have exposed through Supabase RPC, enabling richer server-side logic.

You can extend `supabase/functions/mcp/index.ts` to add more tools (storage operations, analytics queries, etc.). Follow the pattern in the file: describe the tool with Zod, enforce inputs, then call the Supabase client.

## Security notes
- Never commit `.env` files or service role keys to version control. Use a secrets manager or deployment-time environment variables.
- Limit the access token scope when possible; service role keys grant full database access, so rotate them regularly and restrict who can read them.
- For self-hosting, keep `--no-verify-jwt` only for trusted agent use-cases. If you expose the function publicly, configure JWT verification and limit inbound access.

## Further reading
- Supabase MCP Quickstart: https://supabase.com/docs/guides/ai/primitives/mcp
- Self-hosted MCP Edge Functions: https://supabase.com/docs/guides/ai/primitives/mcp#byo-mcp-server

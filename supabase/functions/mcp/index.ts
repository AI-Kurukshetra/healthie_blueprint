import "jsr:@supabase/functions-js/edge-runtime.d.ts";

import { McpServer } from "npm:@modelcontextprotocol/sdk@1.25.3/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "npm:@modelcontextprotocol/sdk@1.25.3/server/webStandardStreamableHttp.js";
import { Hono } from "npm:hono@4.5.10";
import { z } from "npm:zod@3.23.8";
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2.45.3";

const app = new Hono();
const server = new McpServer({
  name: "supabase-mcp-edge",
  version: "0.1.0",
});

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const DEFAULT_SCHEMA = Deno.env.get("SUPABASE_SCHEMA") ?? "public";

// Cache clients per schema to avoid re-creating them on each request.
type GenericClient = SupabaseClient<any, any, any>;
const schemaClients = new Map<string, GenericClient>();

const createSupabaseClientForSchema = (schema: string): GenericClient =>
  createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
    global: {
      headers: {
        "X-Client-Info": "supabase-mcp-edge/0.1.0",
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    db: {
      schema,
    },
  }) as GenericClient;

const getClient = (schema: string): GenericClient | null => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }
  if (!schemaClients.has(schema)) {
    schemaClients.set(schema, createSupabaseClientForSchema(schema));
  }
  return schemaClients.get(schema)!;
};

// Instantiate default schema client eagerly so health checks can report readiness.
if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
  getClient(DEFAULT_SCHEMA);
}

server.registerTool(
  "health_check",
  {
    title: "Health Check",
    description: "Verify that the Supabase MCP Edge Function is running and configured.",
    inputSchema: z.object({}),
  },
  async () => ({
    content: [
      {
        type: "text",
        text: JSON.stringify(
          {
            status: "ok",
            supabaseUrlPresent: Boolean(SUPABASE_URL),
            serviceRoleConfigured: Boolean(SUPABASE_SERVICE_ROLE_KEY),
            defaultSchema: DEFAULT_SCHEMA,
            timestamp: new Date().toISOString(),
          },
          null,
          2,
        ),
      },
    ],
  }),
);

const filterOperators = {
  eq: (builder: any, column: string, value: unknown) => builder.eq(column, value),
  neq: (builder: any, column: string, value: unknown) => builder.neq(column, value),
  gt: (builder: any, column: string, value: unknown) => builder.gt(column, value),
  gte: (builder: any, column: string, value: unknown) => builder.gte(column, value),
  lt: (builder: any, column: string, value: unknown) => builder.lt(column, value),
  lte: (builder: any, column: string, value: unknown) => builder.lte(column, value),
  like: (builder: any, column: string, value: unknown) => builder.like(column, String(value)),
  ilike: (builder: any, column: string, value: unknown) => builder.ilike(column, String(value)),
  is: (builder: any, column: string, value: unknown) => builder.is(column, value),
  contains: (builder: any, column: string, value: unknown) => builder.contains(column, value),
  containedBy: (builder: any, column: string, value: unknown) => builder.containedBy(column, value),
  overlaps: (builder: any, column: string, value: unknown) => builder.overlaps(column, value),
  in: (builder: any, column: string, value: unknown) =>
    builder.in(column, Array.isArray(value) ? value.map(String) : String(value).split(",")),
} as const;

server.registerTool(
  "supabase_select",
  {
    title: "Select rows from a Supabase table",
    description:
      "Runs a filtered PostgREST select query using the service role key. Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
    inputSchema: z.object({
      table: z.string().min(1),
      schema: z.string().min(1).optional(),
      columns: z.array(z.string()).optional(),
      limit: z.number().int().min(1).max(500).default(100),
      offset: z.number().int().min(0).default(0),
      filters: z
        .array(
          z.object({
            column: z.string().min(1),
            operator: z.enum([
              "eq",
              "neq",
              "gt",
              "gte",
              "lt",
              "lte",
              "like",
              "ilike",
              "is",
              "contains",
              "containedBy",
              "overlaps",
              "in",
            ]),
            value: z.union([
              z.string(),
              z.number(),
              z.boolean(),
              z.null(),
              z.array(z.unknown()),
              z.record(z.unknown()),
            ]),
          }),
        )
        .optional(),
    }),
  },
  async ({ table, schema, columns, limit, offset, filters = [] }) => {
    const targetSchema = schema ?? DEFAULT_SCHEMA;
    const client = getClient(targetSchema);
    if (!client) {
      throw new Error("Supabase client is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }

    let query: any = client
      .from(table)
      .select(columns?.join(",") ?? "*", { head: false, count: "exact" });

    for (const filter of filters) {
      const operator = filter.operator as keyof typeof filterOperators;
      const apply = filterOperators[operator];
      if (apply) {
        query = apply(query, filter.column, filter.value);
      }
    }

    query = query.throwOnError();

    const rangeEnd = offset + limit - 1;
    const { data, count } = await query.range(offset, rangeEnd);

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              table,
              schema: targetSchema,
              limit,
              offset,
              rows: data ?? [],
              returned: data?.length ?? 0,
              count: count ?? null,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

server.registerTool(
  "supabase_rpc",
  {
    title: "Invoke a Supabase Postgres function",
    description:
      "Calls a Postgres function exposed through Supabase RPC. Useful for encapsulating complex queries in SQL.",
    inputSchema: z.object({
      functionName: z.string().min(1),
      schema: z.string().min(1).optional(),
      args: z.record(z.unknown()).optional(),
    }),
  },
  async ({ functionName, schema, args }) => {
    const targetSchema = schema ?? DEFAULT_SCHEMA;
    const client = getClient(targetSchema);
    if (!client) {
      throw new Error("Supabase client is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
    }

    const { data } = await client
      .rpc(functionName, args ?? {})
      .throwOnError();

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(
            {
              functionName,
              schema: targetSchema,
              args: args ?? {},
              result: data,
            },
            null,
            2,
          ),
        },
      ],
    };
  },
);

app.all("*", async (c) => {
  const transport = new WebStandardStreamableHTTPServerTransport();
  await server.connect(transport);
  return transport.handleRequest(c.req.raw);
});

Deno.serve(app.fetch);

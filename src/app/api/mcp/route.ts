import { NextRequest, NextResponse } from "next/server";
import type {
  MCPRequest,
  MCPResponse,
  MCPToolCallResult,
} from "@/lib/mcp-types";

const MCP_ENDPOINT = "https://senectus-ai.medusajs.app/mcp/mcp";

/**
 * Helper function to extract JSON from SSE (Server-Sent Events) response
 * MCP endpoint returns data in SSE format with "data: " prefix
 */
function extractJsonFromSSE(sseText: string): string {
  const lines = sseText.split("\n");
  for (const line of lines) {
    if (line.startsWith("data: ")) {
      return line.substring(6); // Remove "data: " prefix
    }
  }
  throw new Error("No data found in SSE response");
}

/**
 * POST /api/mcp
 * Proxy endpoint for MCP (Model Context Protocol) requests
 *
 * Forwards JSON-RPC 2.0 requests to the Medusa MCP server and returns the response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate JSON-RPC 2.0 request format
    if (!body.jsonrpc || body.jsonrpc !== "2.0") {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: body.id || null,
          error: {
            code: -32600,
            message: "Invalid Request - jsonrpc must be '2.0'",
          },
        },
        { status: 400 }
      );
    }

    if (!body.method) {
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: body.id || null,
          error: {
            code: -32600,
            message: "Invalid Request - method is required",
          },
        },
        { status: 400 }
      );
    }

    // Forward request to MCP endpoint
    const mcpResponse = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: JSON.stringify(body),
    });

    if (!mcpResponse.ok) {
      throw new Error(`MCP server responded with status ${mcpResponse.status}`);
    }

    // Parse SSE response
    const sseText = await mcpResponse.text();
    const jsonText = extractJsonFromSSE(sseText);
    const jsonResponse = JSON.parse(jsonText);

    // Return the parsed JSON response
    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("MCP proxy error:", error);

    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: "Internal error",
          data: error instanceof Error ? error.message : String(error),
        },
      },
      { status: 500 }
    );
  }
}

/**
 * Helper function to call an MCP tool
 * This can be used server-side in Server Components or Server Actions
 */
export async function callMCPTool<T = unknown>(
  toolName: string,
  args?: unknown
): Promise<T> {
  const request: MCPRequest = {
    jsonrpc: "2.0",
    id: Date.now(),
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args || {},
    },
  };

  const response = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`MCP server responded with status ${response.status}`);
  }

  const sseText = await response.text();
  const jsonText = extractJsonFromSSE(sseText);
  const jsonResponse: MCPResponse<MCPToolCallResult<T>> = JSON.parse(jsonText);

  if (jsonResponse.error) {
    throw new Error(
      `MCP tool error: ${jsonResponse.error.message} (code: ${jsonResponse.error.code})`
    );
  }

  if (!jsonResponse.result?.content?.[0]?.text) {
    throw new Error("Invalid MCP response format");
  }

  // Parse the tool result from the content text
  return JSON.parse(jsonResponse.result.content[0].text) as T;
}

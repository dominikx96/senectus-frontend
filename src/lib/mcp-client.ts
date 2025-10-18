import type {
  MCPRequest,
  MCPResponse,
  ListUserCartsResponse,
  CreateOrderResponse,
  ShippingAddress,
} from "./types";

const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL || "http://localhost:9000/mcp/mcp";

let requestIdCounter = 0;

/**
 * Make an MCP JSON-RPC request
 */
async function mcpRequest<T>(
  toolName: string,
  args: Record<string, unknown>
): Promise<T> {
  const request: MCPRequest = {
    jsonrpc: "2.0",
    id: ++requestIdCounter,
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args,
    },
  };

  const response = await fetch(MCP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`MCP request failed: ${response.status} ${response.statusText}`);
  }

  const mcpResponse: MCPResponse<T> = await response.json();

  // Parse the JSON from result.content[0].text
  if (
    !mcpResponse.result?.content?.[0]?.text
  ) {
    throw new Error("Invalid MCP response format");
  }

  const data = JSON.parse(mcpResponse.result.content[0].text);
  return data as T;
}

/**
 * List carts for a specific user email
 */
export async function listUserCarts(email: string, limit = 100): Promise<ListUserCartsResponse> {
  return mcpRequest<ListUserCartsResponse>("list_user_carts", {
    email,
    limit,
  });
}

/**
 * Create an order from a cart (Accept action)
 */
export async function createOrder(
  cartId: string,
  email: string,
  shippingAddress: ShippingAddress
): Promise<CreateOrderResponse> {
  return mcpRequest<CreateOrderResponse>("create_order", {
    cart_id: cartId,
    email,
    shipping_address: shippingAddress,
  });
}

/**
 * Delete a cart (Reject action)
 * Note: Assumes delete_cart MCP tool exists
 */
export async function deleteCart(cartId: string): Promise<{ success: boolean; message: string }> {
  return mcpRequest<{ success: boolean; message: string }>("delete_cart", {
    cart_id: cartId,
  });
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  MCPRequest,
  MCPResponse,
  MCPToolCallResult,
  ListRegionsResult,
  ListProductsResult,
  Product,
  CreateCartInput,
  CreateCartResult,
  GetCartResult,
  AddToCartInput,
  AddToCartResult,
  UpdateCartItemInput,
  UpdateCartItemResult,
  ListUserCartsInput,
  ListUserCartsResult,
  CreateOrderInput,
  CreateOrderResult,
} from "./mcp-types";

/**
 * Helper function to call MCP API endpoint
 */
async function callMCPTool<T>(
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

  const response = await fetch("/api/mcp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const jsonResponse: MCPResponse<MCPToolCallResult<T>> = await response.json();

  if (jsonResponse.error) {
    throw new Error(
      `MCP error: ${jsonResponse.error.message} (code: ${jsonResponse.error.code})`
    );
  }

  if (!jsonResponse.result?.content?.[0]?.text) {
    throw new Error("Invalid MCP response format");
  }

  return JSON.parse(jsonResponse.result.content[0].text) as T;
}

// ============================================================================
// REGIONS
// ============================================================================

/**
 * Hook to fetch available regions
 */
export function useRegions() {
  return useQuery({
    queryKey: ["regions"],
    queryFn: () => callMCPTool<ListRegionsResult>("list_regions"),
  });
}

// ============================================================================
// PRODUCTS
// ============================================================================

/**
 * Hook to fetch products list
 */
export function useProducts(params?: { limit?: number; offset?: number }) {
  return useQuery({
    queryKey: ["products", params],
    queryFn: () => callMCPTool<ListProductsResult>("list_products", params || {}),
  });
}

/**
 * Hook to fetch a single product by ID
 */
export function useProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ["product", productId],
    queryFn: () => callMCPTool<Product>("get_product", { id: productId }),
    enabled: !!productId,
  });
}

// ============================================================================
// CARTS
// ============================================================================

/**
 * Hook to fetch cart by ID
 */
export function useCart(cartId: string | undefined) {
  return useQuery({
    queryKey: ["cart", cartId],
    queryFn: () => callMCPTool<GetCartResult>("get_cart", { id: cartId }),
    enabled: !!cartId,
  });
}

/**
 * Hook to fetch carts by email or customer_id
 */
export function useUserCarts(params: ListUserCartsInput) {
  return useQuery({
    queryKey: ["user-carts", params],
    queryFn: () => callMCPTool<ListUserCartsResult>("list_user_carts", params),
    enabled: !!(params.email || params.customer_id),
  });
}

/**
 * Hook to create a new cart
 */
export function useCreateCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCartInput) =>
      callMCPTool<CreateCartResult>("create_cart", input),
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ["user-carts"] });
      // Set the new cart data in cache
      queryClient.setQueryData(["cart", data.cart_id], data.cart);
    },
  });
}

/**
 * Hook to add items to an existing cart
 */
export function useAddToCart() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: AddToCartInput) =>
      callMCPTool<AddToCartResult>("add_to_cart", input),
    onSuccess: (_, variables) => {
      // Invalidate the specific cart query
      queryClient.invalidateQueries({ queryKey: ["cart", variables.cart_id] });
      queryClient.invalidateQueries({ queryKey: ["user-carts"] });
    },
  });
}

/**
 * Hook to update cart item quantity
 */
export function useUpdateCartItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateCartItemInput) =>
      callMCPTool<UpdateCartItemResult>("update_cart_item", input),
    onSuccess: (_, variables) => {
      // Invalidate the specific cart query
      queryClient.invalidateQueries({ queryKey: ["cart", variables.cart_id] });
      queryClient.invalidateQueries({ queryKey: ["user-carts"] });
    },
  });
}

// ============================================================================
// ORDERS
// ============================================================================

/**
 * Hook to create an order from a cart
 */
export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateOrderInput) =>
      callMCPTool<CreateOrderResult>("create_order", input),
    onSuccess: (_, variables) => {
      // Invalidate cart queries since the cart is now completed
      queryClient.invalidateQueries({ queryKey: ["cart", variables.cart_id] });
      queryClient.invalidateQueries({ queryKey: ["user-carts"] });
    },
  });
}

// MCP JSON-RPC Types
export interface MCPRequest {
  jsonrpc: "2.0";
  id: number;
  method: string;
  params: {
    name: string;
    arguments: Record<string, unknown>;
  };
}

export interface MCPResponse<T> {
  jsonrpc: "2.0";
  id: number;
  result: {
    content: Array<{
      type: string;
      text: string;
    }>;
  };
}

// Cart & Product Types
export interface Product {
  id: string;
  title: string;
  thumbnail?: string;
}

export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  product: Product;
  unit_price: number;
  subtotal: number;
}

export interface Cart {
  id: string;
  email: string;
  customer_id?: string;
  region_id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ListUserCartsResponse {
  count: number;
  filters: {
    email?: string;
    customer_id?: string;
    limit?: number;
  };
  carts: Cart[];
}

export interface ShippingAddress {
  first_name: string;
  last_name: string;
  address_1: string;
  address_2?: string;
  city: string;
  country_code: string;
  postal_code: string;
  province?: string;
  phone?: string;
}

export interface CreateOrderResponse {
  order_id: string;
  order: {
    id: string;
    cart_id: string;
    status: string;
    email: string;
    total: number;
  };
}

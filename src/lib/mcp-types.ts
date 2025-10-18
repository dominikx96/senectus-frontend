// MCP JSON-RPC 2.0 Types

export interface MCPRequest<T = unknown> {
  jsonrpc: "2.0";
  id: number | string;
  method: "tools/list" | "tools/call";
  params?: T;
}

export interface MCPToolCallParams {
  name: string;
  arguments: Record<string, unknown>;
}

export interface MCPResponse<T = unknown> {
  jsonrpc: "2.0";
  id: number | string;
  result: T;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
}

export interface MCPToolContent {
  type: "text";
  text: string;
}

export interface MCPToolCallResult<T = unknown> {
  content: MCPToolContent[];
  isError?: boolean;
}

// Region Types
export interface Region {
  id: string;
  name: string;
  currency_code: string;
  tax_rate: number;
  countries: Array<{
    id: string;
    name: string;
    iso_2: string;
  }>;
}

export interface ListRegionsResult {
  regions: Region[];
  count: number;
}

// Product Types
export interface ProductVariant {
  id: string;
  title: string;
  sku?: string;
  prices: Array<{
    amount: number;
    currency_code: string;
  }>;
  inventory_quantity: number;
}

export interface Product {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  handle: string;
  thumbnail?: string;
  variants: ProductVariant[];
  collection_id?: string;
  type_id?: string;
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  hs_code?: string;
  origin_country?: string;
  mid_code?: string;
  material?: string;
  created_at: string;
  updated_at: string;
}

export interface ListProductsResult {
  products: Product[];
  count: number;
  offset: number;
  limit: number;
}

// Cart Types
export interface CartItem {
  id: string;
  cart_id: string;
  variant_id: string;
  quantity: number;
  product: {
    id: string;
    title: string;
    thumbnail?: string;
  };
  variant: {
    id: string;
    title: string;
    sku?: string;
  };
  unit_price: number;
  total: number;
}

export interface Cart {
  id: string;
  email: string;
  customer_id?: string;
  region_id: string;
  items: CartItem[];
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  total: number;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface CreateCartInput {
  region_id: string;
  email: string;
  items?: Array<{
    variant_id: string;
    quantity: number;
  }>;
}

export interface CreateCartResult {
  cart_id: string;
  cart: Cart;
}

export interface GetCartResult {
  id: string;
  email: string;
  customer_id?: string;
  region_id: string;
  items: CartItem[];
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface AddToCartInput {
  cart_id: string;
  items: Array<{
    variant_id: string;
    quantity: number;
  }>;
}

export interface AddToCartResult {
  message: string;
  cart: Cart;
}

export interface UpdateCartItemInput {
  cart_id: string;
  item_id: string;
  quantity: number;
}

export interface UpdateCartItemResult {
  message: string;
  cart: Cart;
}

export interface ListUserCartsInput {
  email?: string;
  customer_id?: string;
  limit?: number;
  offset?: number;
}

export interface ListUserCartsResult {
  carts: Cart[];
  count: number;
  filters: {
    email?: string;
    customer_id?: string;
  };
}

// Order Types
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

export interface CreateOrderInput {
  cart_id: string;
  email: string;
  shipping_address: ShippingAddress;
}

export interface Order {
  id: string;
  cart_id: string;
  customer_id?: string;
  email: string;
  status: string;
  fulfillment_status: string;
  payment_status: string;
  display_id: number;
  currency_code: string;
  tax_rate?: number;
  region_id: string;
  items: CartItem[];
  shipping_address: ShippingAddress;
  billing_address?: ShippingAddress;
  subtotal: number;
  tax_total: number;
  shipping_total: number;
  total: number;
  created_at: string;
  updated_at: string;
}

export interface CreateOrderResult {
  order_id: string;
  order: Order;
  message: string;
}

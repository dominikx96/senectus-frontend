# MCP Hooks Usage Guide

This guide shows how to use the react-query hooks for interacting with the Medusa MCP server.

## API Architecture

```
Client Component → React Query Hook → /api/mcp (Next.js API Route) → MCP Server (localhost:9000)
```

The API route (`/api/mcp`) acts as a proxy to the MCP endpoint, handling SSE response parsing and error handling.

## Available Hooks

### Queries (Read Operations)

#### `useRegions()`
Fetch available shipping regions.

```tsx
"use client";

import { useRegions } from "@/lib/mcp-hooks";

export function RegionSelector() {
  const { data, isLoading, error } = useRegions();

  if (isLoading) return <div>Loading regions...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <select>
      {data?.regions.map((region) => (
        <option key={region.id} value={region.id}>
          {region.name} ({region.currency_code})
        </option>
      ))}
    </select>
  );
}
```

#### `useProducts(params?)`
Fetch products list with optional pagination.

```tsx
"use client";

import { useProducts } from "@/lib/mcp-hooks";

export function ProductList() {
  const { data, isLoading } = useProducts({ limit: 10, offset: 0 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Total products: {data?.count}</p>
      {data?.products.map((product) => (
        <div key={product.id}>
          <h3>{product.title}</h3>
          <p>{product.description}</p>
        </div>
      ))}
    </div>
  );
}
```

#### `useProduct(productId)`
Fetch a single product with variants.

```tsx
"use client";

import { useProduct } from "@/lib/mcp-hooks";

export function ProductDetail({ productId }: { productId: string }) {
  const { data: product, isLoading } = useProduct(productId);

  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div>
      <h1>{product.title}</h1>
      <p>{product.description}</p>
      <h2>Variants:</h2>
      {product.variants.map((variant) => (
        <div key={variant.id}>
          <p>{variant.title} - ${variant.prices[0]?.amount / 100}</p>
        </div>
      ))}
    </div>
  );
}
```

#### `useCart(cartId)`
Fetch cart details by ID.

```tsx
"use client";

import { useCart } from "@/lib/mcp-hooks";

export function CartView({ cartId }: { cartId: string }) {
  const { data: cart, isLoading } = useCart(cartId);

  if (isLoading) return <div>Loading cart...</div>;
  if (!cart) return <div>Cart not found</div>;

  return (
    <div>
      <h2>Cart for {cart.email}</h2>
      <p>Total: ${cart.total / 100}</p>
      <ul>
        {cart.items.map((item) => (
          <li key={item.id}>
            {item.product.title} x {item.quantity} = ${item.total / 100}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

#### `useUserCarts(params)`
Fetch carts by email or customer_id.

```tsx
"use client";

import { useUserCarts } from "@/lib/mcp-hooks";

export function UserCarts({ email }: { email: string }) {
  const { data, isLoading } = useUserCarts({ email, limit: 10 });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <p>Found {data?.count} carts for {email}</p>
      {data?.carts.map((cart) => (
        <div key={cart.id}>
          <p>Cart ID: {cart.id}</p>
          <p>Items: {cart.items.length}</p>
          <p>Total: ${cart.total / 100}</p>
        </div>
      ))}
    </div>
  );
}
```

### Mutations (Write Operations)

#### `useCreateCart()`
Create a new shopping cart.

```tsx
"use client";

import { useCreateCart } from "@/lib/mcp-hooks";
import { useState } from "react";

export function CreateCartForm() {
  const [email, setEmail] = useState("");
  const createCart = useCreateCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await createCart.mutateAsync({
        region_id: "reg_01JXXXXXXXXX", // Get from useRegions()
        email,
        items: [
          {
            variant_id: "variant_01JXXXXXXXXX",
            quantity: 1,
          },
        ],
      });

      console.log("Cart created:", result.cart_id);
    } catch (error) {
      console.error("Error creating cart:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <button type="submit" disabled={createCart.isPending}>
        {createCart.isPending ? "Creating..." : "Create Cart"}
      </button>
    </form>
  );
}
```

#### `useAddToCart()`
Add items to an existing cart.

```tsx
"use client";

import { useAddToCart } from "@/lib/mcp-hooks";

export function AddToCartButton({
  cartId,
  variantId
}: {
  cartId: string;
  variantId: string;
}) {
  const addToCart = useAddToCart();

  const handleAdd = async () => {
    try {
      await addToCart.mutateAsync({
        cart_id: cartId,
        items: [{ variant_id: variantId, quantity: 1 }],
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
    }
  };

  return (
    <button onClick={handleAdd} disabled={addToCart.isPending}>
      {addToCart.isPending ? "Adding..." : "Add to Cart"}
    </button>
  );
}
```

#### `useUpdateCartItem()`
Update item quantity in cart.

```tsx
"use client";

import { useUpdateCartItem } from "@/lib/mcp-hooks";

export function CartItemQuantity({
  cartId,
  itemId,
  currentQuantity
}: {
  cartId: string;
  itemId: string;
  currentQuantity: number;
}) {
  const updateCartItem = useUpdateCartItem();

  const handleUpdate = async (newQuantity: number) => {
    try {
      await updateCartItem.mutateAsync({
        cart_id: cartId,
        item_id: itemId,
        quantity: newQuantity,
      });
    } catch (error) {
      console.error("Error updating cart item:", error);
    }
  };

  return (
    <div>
      <button onClick={() => handleUpdate(currentQuantity - 1)}>-</button>
      <span>{currentQuantity}</span>
      <button onClick={() => handleUpdate(currentQuantity + 1)}>+</button>
    </div>
  );
}
```

#### `useCreateOrder()`
Convert a cart to an order.

```tsx
"use client";

import { useCreateOrder } from "@/lib/mcp-hooks";

export function CheckoutButton({ cartId, email }: { cartId: string; email: string }) {
  const createOrder = useCreateOrder();

  const handleCheckout = async () => {
    try {
      const result = await createOrder.mutateAsync({
        cart_id: cartId,
        email,
        shipping_address: {
          first_name: "John",
          last_name: "Doe",
          address_1: "123 Main St",
          city: "San Francisco",
          country_code: "us",
          postal_code: "94105",
        },
      });

      console.log("Order created:", result.order_id);
      // Redirect to confirmation page or show success message
    } catch (error) {
      console.error("Error creating order:", error);
    }
  };

  return (
    <button onClick={handleCheckout} disabled={createOrder.isPending}>
      {createOrder.isPending ? "Processing..." : "Complete Order"}
    </button>
  );
}
```

## Complete Example: Order Review Page

```tsx
"use client";

import { useCart, useCreateOrder } from "@/lib/mcp-hooks";
import { useState } from "react";

export default function OrderReviewPage({ cartId }: { cartId: string }) {
  const { data: cart, isLoading } = useCart(cartId);
  const createOrder = useCreateOrder();
  const [status, setStatus] = useState<"pending" | "approved" | "declined">("pending");

  const handleApprove = async () => {
    if (!cart) return;

    try {
      const result = await createOrder.mutateAsync({
        cart_id: cartId,
        email: cart.email,
        shipping_address: {
          first_name: "Senior",
          last_name: "User",
          address_1: "123 Care Home Lane",
          city: "San Francisco",
          country_code: "us",
          postal_code: "94105",
        },
      });

      setStatus("approved");
      console.log("Order approved and created:", result.order_id);
    } catch (error) {
      console.error("Error approving order:", error);
    }
  };

  const handleDecline = () => {
    setStatus("declined");
    // Optionally delete or mark the cart as declined
  };

  if (isLoading) return <div>Loading order...</div>;
  if (!cart) return <div>Order not found</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Order Review</h1>

      <div className="mb-6">
        <p><strong>Customer:</strong> {cart.email}</p>
        <p><strong>Total:</strong> ${(cart.total / 100).toFixed(2)}</p>
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Items:</h2>
        <ul className="space-y-2">
          {cart.items.map((item) => (
            <li key={item.id} className="flex justify-between">
              <span>
                {item.product.title} ({item.variant.title}) x {item.quantity}
              </span>
              <span>${(item.total / 100).toFixed(2)}</span>
            </li>
          ))}
        </ul>
      </div>

      {status === "pending" && (
        <div className="flex gap-4">
          <button
            onClick={handleApprove}
            disabled={createOrder.isPending}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {createOrder.isPending ? "Processing..." : "Approve Order"}
          </button>
          <button
            onClick={handleDecline}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Decline Order
          </button>
        </div>
      )}

      {status === "approved" && (
        <div className="p-4 bg-green-100 text-green-800 rounded">
          Order approved and submitted!
        </div>
      )}

      {status === "declined" && (
        <div className="p-4 bg-red-100 text-red-800 rounded">
          Order declined.
        </div>
      )}
    </div>
  );
}
```

## Environment Variables

Make sure to set the MCP endpoint in your `.env.local`:

```env
MCP_ENDPOINT=http://localhost:9000/mcp/mcp
```

## Auto-Refetching

The QueryProvider is configured to:
- Poll queries every 5 seconds (refetchInterval: 5000)
- Refetch when window regains focus
- Retry failed requests 2 times

This ensures the dashboard stays up-to-date with the latest order data from seniors' phone calls.

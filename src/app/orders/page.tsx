"use client";

import { useState } from "react";
import type { Cart } from "@/lib/types";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CartItem } from "@/components/cart-item";
import { Check, X, Loader2, ShoppingCart } from "lucide-react";
import { ElevenLabsWidget } from "@/components/elevenlabs-widget";

// Hardcoded cart data for testing
const HARDCODED_CARTS: Cart[] = [
  {
    id: "cart_01JGXYZ123456789",
    email: "margaret.johnson@example.com",
    region_id: "reg_01HJBQFQK1EXAMPLE",
    items: [
      {
        id: "item_01JGXYZ111111111",
        cart_id: "cart_01JGXYZ123456789",
        variant_id: "variant_bread_wheat",
        quantity: 2,
        product: {
          id: "prod_bread_wheat",
          title: "Whole Wheat Bread",
          thumbnail: "/images/bread.jpg",
        },
        unit_price: 349,
        subtotal: 698,
      },
      {
        id: "item_01JGXYZ222222222",
        cart_id: "cart_01JGXYZ123456789",
        variant_id: "variant_milk_2pct",
        quantity: 1,
        product: {
          id: "prod_milk_2pct",
          title: "2% Milk - 1 Gallon",
          thumbnail: "/images/milk.jpg",
        },
        unit_price: 499,
        subtotal: 499,
      },
      {
        id: "item_01JGXYZ333333333",
        cart_id: "cart_01JGXYZ123456789",
        variant_id: "variant_eggs_dozen",
        quantity: 1,
        product: {
          id: "prod_eggs_dozen",
          title: "Large Eggs - Dozen",
          thumbnail: "/images/eggs.jpg",
        },
        unit_price: 429,
        subtotal: 429,
      },
    ],
    subtotal: 1626,
    total: 1626,
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
  },
  {
    id: "cart_01JGXYZ987654321",
    email: "robert.smith@example.com",
    region_id: "reg_01HJBQFQK1EXAMPLE",
    items: [
      {
        id: "item_01JGXYZ444444444",
        cart_id: "cart_01JGXYZ987654321",
        variant_id: "variant_bananas",
        quantity: 3,
        product: {
          id: "prod_bananas",
          title: "Bananas - Organic (per lb)",
          thumbnail: "/images/bananas.jpg",
        },
        unit_price: 79,
        subtotal: 237,
      },
      {
        id: "item_01JGXYZ555555555",
        cart_id: "cart_01JGXYZ987654321",
        variant_id: "variant_chicken",
        quantity: 1,
        product: {
          id: "prod_chicken",
          title: "Chicken Breast - 1 lb",
          thumbnail: "/images/chicken.jpg",
        },
        unit_price: 899,
        subtotal: 899,
      },
    ],
    subtotal: 1136,
    total: 1136,
    created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 minutes ago
    updated_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), // 25 minutes ago
  },
];

export default function OrdersPage() {
  const [carts, setCarts] = useState<Cart[]>(HARDCODED_CARTS);
  const [processingCart, setProcessingCart] = useState<string | null>(null);

  const handleAccept = async (cart: Cart) => {
    setProcessingCart(cart.id);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Remove cart from list after acceptance
    setCarts((prev) => prev.filter((c) => c.id !== cart.id));
    setProcessingCart(null);
  };

  const handleReject = async (cartId: string) => {
    setProcessingCart(cartId);
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Remove cart from list after rejection
    setCarts((prev) => prev.filter((c) => c.id !== cartId));
    setProcessingCart(null);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price / 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (carts.length === 0) {
    return (
      <>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Card className="p-8 max-w-md">
            <div className="flex flex-col items-center gap-4 text-center">
              <ShoppingCart className="size-16 text-muted-foreground" />
              <div>
                <h2 className="text-lg font-semibold">No Orders Yet</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  No pending orders from seniors at the moment.
                </p>
              </div>
            </div>
          </Card>
        </div>
        <ElevenLabsWidget />
      </>
    );
  }

  return (
    <>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Pending Orders</h1>
          <p className="text-muted-foreground mt-2">
            Review and manage grocery orders placed by seniors
          </p>
          <Badge variant="outline" className="mt-4">
            {carts.length} {carts.length === 1 ? "order" : "orders"} pending review
          </Badge>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {carts.map((cart) => (
            <AccordionItem
              key={cart.id}
              value={cart.id}
              className="border rounded-lg px-4 bg-card"
            >
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center justify-between w-full pr-4">
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-semibold">Order #{cart.id.slice(0, 8)}</span>
                    <span className="text-sm text-muted-foreground">{cart.email}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        {cart.items.length} {cart.items.length === 1 ? "item" : "items"}
                      </div>
                      <div className="font-semibold">{formatPrice(cart.total)}</div>
                    </div>
                    <Badge variant="secondary">
                      {formatDate(cart.created_at)}
                    </Badge>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 space-y-4">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-2">
                      {cart.items.map((item) => (
                        <CartItem key={item.id} item={item} />
                      ))}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPrice(cart.subtotal)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg mt-2">
                        <span>Total</span>
                        <span>{formatPrice(cart.total)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => handleAccept(cart)}
                      disabled={processingCart === cart.id}
                      className="flex-1"
                    >
                      {processingCart === cart.id ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Approving...
                        </>
                      ) : (
                        <>
                          <Check className="mr-2 size-4" />
                          Accept Order
                        </>
                      )}
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleReject(cart.id)}
                      disabled={processingCart === cart.id}
                      className="flex-1"
                    >
                      {processingCart === cart.id ? (
                        <>
                          <Loader2 className="mr-2 size-4 animate-spin" />
                          Rejecting...
                        </>
                      ) : (
                        <>
                          <X className="mr-2 size-4" />
                          Reject Order
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      {/* ElevenLabs Conversational AI Widget */}
      <ElevenLabsWidget />
    </>
  );
}

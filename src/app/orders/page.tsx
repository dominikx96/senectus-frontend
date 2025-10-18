"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { listUserCarts, createOrder, deleteCart } from "@/lib/mcp-client";
import type { Cart, ShippingAddress } from "@/lib/types";
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

const SENIOR_EMAIL = process.env.NEXT_PUBLIC_SENIOR_EMAIL || "senior@example.com";

export default function OrdersPage() {
  const queryClient = useQueryClient();

  // Fetch carts with 5-second polling
  const { data, isLoading, error } = useQuery({
    queryKey: ["carts", SENIOR_EMAIL],
    queryFn: () => listUserCarts(SENIOR_EMAIL),
    refetchInterval: 5000,
  });

  // Mutation for accepting (creating order)
  const acceptMutation = useMutation({
    mutationFn: async (cart: Cart) => {
      // Default shipping address - in production, this should come from senior's profile
      const shippingAddress: ShippingAddress = {
        first_name: cart.email.split("@")[0],
        last_name: "Senior",
        address_1: "123 Main St",
        city: "San Francisco",
        country_code: "us",
        postal_code: "94105",
      };

      return createOrder(cart.id, cart.email, shippingAddress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carts"] });
    },
  });

  // Mutation for rejecting (deleting cart)
  const rejectMutation = useMutation({
    mutationFn: (cartId: string) => deleteCart(cartId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["carts"] });
    },
  });

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

  if (isLoading) {
    return (
      <>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
            <span>Loading orders...</span>
          </div>
        </div>
        <ElevenLabsWidget />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
          <Card className="p-6 max-w-md">
            <div className="flex flex-col items-center gap-4 text-center">
              <X className="size-12 text-destructive" />
              <div>
                <h2 className="text-lg font-semibold">Error Loading Orders</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {error instanceof Error ? error.message : "An unknown error occurred"}
                </p>
              </div>
            </div>
          </Card>
        </div>
        <ElevenLabsWidget />
      </>
    );
  }

  const carts = data?.carts || [];

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
                      onClick={() => acceptMutation.mutate(cart)}
                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                      className="flex-1"
                    >
                      {acceptMutation.isPending ? (
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
                      onClick={() => rejectMutation.mutate(cart.id)}
                      disabled={acceptMutation.isPending || rejectMutation.isPending}
                      className="flex-1"
                    >
                      {rejectMutation.isPending ? (
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

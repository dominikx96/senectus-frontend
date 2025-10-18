import type { CartItem as CartItemType } from "@/lib/types";

interface CartItemProps {
  item: CartItemType;
}

export function CartItem({ item }: CartItemProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price / 100);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b last:border-0">
      <div className="flex-1">
        <p className="font-medium">{item.product.title}</p>
        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-muted-foreground">
          {formatPrice(item.unit_price)} each
        </p>
        <p className="font-medium">{formatPrice(item.subtotal)}</p>
      </div>
    </div>
  );
}

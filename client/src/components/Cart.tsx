import React from "react";
import { ShoppingCart, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/hooks/useSweetKiosk";

interface CartProps {
  cart: CartItem[];
  totalItems: number;
  totalPrice: number;
  onUpdateQuantity: (sweetId: number, newQuantity: number) => void;
  onPlaceOrder: () => void;
  orderPending: boolean;
}

export const Cart: React.FC<CartProps> = ({
  cart,
  totalItems,
  totalPrice,
  onUpdateQuantity,
  onPlaceOrder,
  orderPending,
}) => {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="lg"
          className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
        >
          <ShoppingCart className="w-5 h-5 mr-2" />
          View Order
          {totalItems > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black">
              {totalItems}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="text-xl">Your Order</SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {cart.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No items in your order
            </p>
          ) : (
            <>
              {cart.map((item) => (
                <div
                  key={item.sweetId}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{item.sweet.name}</h3>
                    <p className="text-gray-600">₹{item.sweet.price} each</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdateQuantity(item.sweetId, item.quantity - 1)
                      }
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    <span className="w-8 text-center font-semibold text-lg">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        onUpdateQuantity(item.sweetId, item.quantity + 1)
                      }
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="space-y-2">
                <div className="flex justify-between items-center text-lg">
                  <span>Total Items:</span>
                  <span className="font-semibold">{totalItems}</span>
                </div>
                <div className="flex justify-between items-center text-xl font-bold">
                  <span>Total Price:</span>
                  <span className="text-pink-600">
                    ₹{totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
              <Button
                onClick={onPlaceOrder}
                size="lg"
                className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-lg py-6"
                disabled={orderPending}
              >
                {orderPending ? "Placing Order..." : "Place Order"}
              </Button>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

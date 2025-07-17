import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface OrderSuccessProps {
  currentOrderId: string;
  userToken: string;
  onStartNewOrder: () => void;
}

export const OrderSuccess: React.FC<OrderSuccessProps> = ({
  currentOrderId,
  userToken,
  onStartNewOrder,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
      <Card className="w-full max-w-md mx-4 text-center">
        <CardContent className="p-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">✅</span>
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-4">
            Order Placed!
          </h2>
          <div className="space-y-2 mb-6">
            <p className="text-lg font-semibold">Order ID: {currentOrderId}</p>
            <p className="text-lg font-semibold">Token: {userToken}</p>
            <p className="text-gray-600">
              Please remember your order ID and token number
            </p>
          </div>
          <Button
            onClick={onStartNewOrder}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700"
          >
            Place New Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

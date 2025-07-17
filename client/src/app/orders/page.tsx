"use client";

import { useState } from "react";
import { Package, Clock, CheckCircle, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, getOrderByToken } from "@/lib/dataGetter";
import { updateOrderStatus } from "@/lib/dataPutter";
import { OrderStatusUpdate } from "@/components/OrderStatusUpdate";
import Link from "next/link";

// Types based on the API response
interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  orderId: string;
  sweetId: number;
  createdAt: string;
  updatedAt: string;
  sweet: {
    id: number;
    name: string;
    category: string;
    price: number;
    quantity: number;
    createdAt: string;
    updatedAt: string;
  };
}

interface Order {
  id: string;
  token: string;
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

export default function OrdersPage() {
  const [searchToken, setSearchToken] = useState("");
  const [displayOrders, setDisplayOrders] = useState<Order[]>([]);
  const [isSearchMode, setIsSearchMode] = useState(false);

  const queryClient = useQueryClient();

  // Fetch all orders initially
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  // Search by token mutation
  const { mutate: searchByTokenMutate, isPending } = useMutation({
    mutationFn: (token: string) => getOrderByToken(token),
    onSuccess: (response) => {
      if (response?.success && response?.data) {
        // getOrderByToken returns a single order, so wrap it in an array
        setDisplayOrders(
          Array.isArray(response.data) ? response.data : [response.data]
        );
        setIsSearchMode(true);
        toast({
          title: "Order Found!",
          description: `Found order with token ${searchToken}`,
        });
      } else {
        setDisplayOrders([]);
        setIsSearchMode(true);
        toast({
          title: "No Order Found",
          description: `No order found with token ${searchToken}`,
          variant: "destructive",
        });
      }
    },
    onError: () => {
      setDisplayOrders([]);
      setIsSearchMode(true);
      toast({
        title: "Search Failed",
        description: "Failed to search for order. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const { mutate: updateStatusMutate, isPending: isStatusUpdating } =
    useMutation({
      mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
        updateOrderStatus(orderId, status),
      onSuccess: (response) => {
        if (response?.success) {
          toast({
            title: "Status Updated!",
            description: "Order status has been updated successfully.",
          });
          // Invalidate and refetch orders
          queryClient.invalidateQueries({ queryKey: ["orders"] });

          // If in search mode, refresh the search results
          if (isSearchMode && searchToken) {
            const tokenNumber = parseInt(searchToken.trim());
            if (!isNaN(tokenNumber)) {
              searchByTokenMutate(tokenNumber.toString());
            }
          }
        } else {
          toast({
            title: "Update Failed",
            description: response?.message || "Failed to update order status.",
            variant: "destructive",
          });
        }
      },
      onError: () => {
        toast({
          title: "Update Failed",
          description: "Failed to update order status. Please try again.",
          variant: "destructive",
        });
      },
    });

  // Use all orders when not in search mode
  const orders = isSearchMode
    ? displayOrders
    : ordersData?.success
    ? ordersData.data
    : [];

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case "pending":
        return <Clock className="w-6 h-6 text-yellow-500" />;
      default:
        return <Clock className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 text-lg px-4 py-2";
      case "pending":
        return "bg-yellow-100 text-yellow-800 text-lg px-4 py-2";
      default:
        return "bg-yellow-100 text-yellow-800 text-lg px-4 py-2";
    }
  };

  const searchByToken = () => {
    if (!searchToken.trim()) {
      toast({
        title: "Invalid Token",
        description: "Please enter a valid token number.",
        variant: "destructive",
      });
      return;
    }

    const tokenNumber = parseInt(searchToken.trim());
    if (isNaN(tokenNumber)) {
      toast({
        title: "Invalid Token",
        description: "Token must be a valid number.",
        variant: "destructive",
      });
      return;
    }

    searchByTokenMutate(tokenNumber.toString());
  };

  const handleStatusUpdate = (orderId: string, newStatus: string) => {
    updateStatusMutate({ orderId, status: newStatus });
  };

  const showAllOrders = () => {
    setIsSearchMode(false);
    setSearchToken("");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-orange-200">
        <div className="container mx-auto px-4 py-4 sm:py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:space-x-4">
              <Link href="/owner">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-fit sm:size-lg"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  <span className="hidden sm:inline">Back to Menu</span>
                  <span className="sm:hidden">Menu</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2">
                <Package className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600" />
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-900">
                  Order Status
                </h1>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search */}
        <Card className="mb-8 bg-white border-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-xl">
              <Search className="w-6 h-6" />
              <span>Check Your Order Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Input
                placeholder="Enter your token number..."
                value={searchToken}
                onChange={(e) => setSearchToken(e.target.value)}
                className="flex-1 text-lg py-6"
              />
              <Button
                onClick={searchByToken}
                disabled={isPending}
                size="lg"
                className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 px-8"
              >
                {isPending ? "Searching..." : "Check Status"}
              </Button>
              {isSearchMode && (
                <Button
                  onClick={showAllOrders}
                  variant="outline"
                  size="lg"
                  className="px-8"
                >
                  Show All Orders
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <div className="space-y-6">
          {isLoading && !isSearchMode ? (
            <Card className="bg-white border-2">
              <CardContent className="text-center py-12">
                <Package className="w-20 h-20 text-gray-400 mx-auto mb-4 animate-pulse" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                  Loading orders...
                </h3>
                <p className="text-gray-500 text-lg">
                  Please wait while we fetch your orders.
                </p>
              </CardContent>
            </Card>
          ) : orders.length === 0 ? (
            <Card className="bg-white border-2">
              <CardContent className="text-center py-12">
                <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-600 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500 text-lg">
                  Enter your token number to check your order status.
                </p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order: Order) => (
              <Card
                key={order.id}
                className="bg-white border-2 hover:shadow-lg transition-shadow"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {getStatusIcon(order.status)}
                      <div>
                        <CardTitle className="text-2xl">
                          Order {order.id}
                        </CardTitle>
                        <p className="text-lg text-gray-600">
                          Token: {order.token}
                        </p>
                      </div>
                    </div>
                    <div className="text-right space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <OrderStatusUpdate
                          orderId={order.id}
                          currentStatus={order.status}
                          onStatusUpdate={handleStatusUpdate}
                          isUpdating={isStatusUpdating}
                        />
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {order.items.map((item: OrderItem, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between py-3 border-b last:border-b-0"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-lg">
                            {item.sweet?.name || item.name}
                          </p>
                          <p className="text-gray-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-lg">
                          ₹
                          {(
                            (item.sweet?.price || item.price) * item.quantity
                          ).toFixed(2)}
                        </p>
                      </div>
                    ))}
                    <Separator />
                    <div className="flex justify-between items-center font-bold text-2xl">
                      <span>Total</span>
                      <span className="text-pink-600">
                        ₹{order.total.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

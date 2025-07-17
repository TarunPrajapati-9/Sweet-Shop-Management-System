"use client";

import { useState, useEffect } from "react";
import { ShoppingCart, Plus, Minus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getSweets } from "@/lib/dataGetter";
import { createOrder } from "@/lib/dataPoster";

// Categories from backend
const categories = [
  "MilkBased",
  "NutBased",
  "VegetableBased",
  "FlourBased",
  "Fried",
  "DryFruitBased",
  "ChocolateBased",
  "FruitBased",
  "CoconutBased",
  "Fusion",
];

const categoryDisplayNames: Record<string, string> = {
  MilkBased: "Milk Based",
  NutBased: "Nut Based",
  VegetableBased: "Vegetable Based",
  FlourBased: "Flour Based",
  Fried: "Fried",
  DryFruitBased: "Dry Fruit Based",
  ChocolateBased: "Chocolate Based",
  FruitBased: "Fruit Based",
  CoconutBased: "Coconut Based",
  Fusion: "Fusion",
};

// Types
interface Sweet {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  quantity: number;
}

interface CartItem {
  sweetId: number;
  quantity: number;
  sweet: Sweet;
}

export default function SweetKiosk() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [userToken, setUserToken] = useState(() => {
    // Generate a unique token using crypto.randomUUID() if available, otherwise fallback
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.randomUUID
    ) {
      return parseInt(
        window.crypto.randomUUID().replace(/-/g, "").slice(0, 8),
        16
      );
    } else {
      // Fallback: Use timestamp + random + performance.now() for better uniqueness
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const performance =
        typeof window !== "undefined" && window.performance
          ? Math.floor(window.performance.now() * 1000) % 10000
          : Math.floor(Math.random() * 10000);
      return parseInt(
        `${timestamp.toString().slice(-4)}${random
          .toString()
          .padStart(4, "0")}${performance.toString().padStart(4, "0")}`.slice(
          0,
          10
        )
      );
    }
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState("");

  // Function to generate a new token
  const generateNewToken = () => {
    if (
      typeof window !== "undefined" &&
      window.crypto &&
      window.crypto.randomUUID
    ) {
      return parseInt(
        window.crypto.randomUUID().replace(/-/g, "").slice(0, 8),
        16
      );
    } else {
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 10000);
      const performance =
        typeof window !== "undefined" && window.performance
          ? Math.floor(window.performance.now() * 1000) % 10000
          : Math.floor(Math.random() * 10000);
      return parseInt(
        `${timestamp.toString().slice(-4)}${random
          .toString()
          .padStart(4, "0")}${performance.toString().padStart(4, "0")}`.slice(
          0,
          10
        )
      );
    }
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["sweets"],
    queryFn: getSweets,
  });

  const { mutate: createOrderMutate, isPending: orderPending } = useMutation({
    mutationFn: createOrder,
    onSuccess: (res) => {
      if (res.success) {
        setCurrentOrderId(res.data.id);
        setOrderPlaced(true);
        setCart([]);
        toast({
          title: "Order placed successfully!",
          description: `Order ${res.data.id} has been sent to the kitchen. Please wait for your order.`,
        });
      } else {
        // Handle specific token conflict error
        if (res.message && res.message.toLowerCase().includes("token")) {
          // Generate new token and retry
          const newToken = generateNewToken();
          setUserToken(newToken);
          toast({
            title: "Token Conflict Detected",
            description:
              "Generated a new token. Please try placing your order again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Order Failed",
            description: "Order has not been placed. " + res.message,
            variant: "destructive",
          });
        }
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to place order. Please try again. " + error,
        variant: "destructive",
      });
    },
  });

  // Initialize with data from database
  useEffect(() => {
    if (data?.data) {
      setSweets(data.data);
    }
  }, [data]);

  const filteredSweets = sweets.filter(
    (sweet) =>
      sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedCategory === "all" || sweet.category === selectedCategory)
  );

  const addToCart = (sweet: Sweet) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.sweetId === sweet.id);
      if (existing) {
        return prev.map((item) =>
          item.sweetId === sweet.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { sweetId: sweet.id, quantity: 1, sweet }];
    });
    toast({
      title: "Added to order",
      description: `${sweet.name} added to your order.`,
    });
  };

  const updateQuantity = (sweetId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      setCart((prev) => prev.filter((item) => item.sweetId !== sweetId));
    } else {
      setCart((prev) =>
        prev.map((item) =>
          item.sweetId === sweetId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const getTotalPrice = () => {
    return cart.reduce(
      (total, item) => total + item.sweet.price * item.quantity,
      0
    );
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const placeOrder = async () => {
    if (cart.length === 0) {
      toast({
        title: "No items selected",
        description: "Please add some items to your order.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      token: userToken,
      items: cart.map((item) => ({
        sweetId: item.sweetId,
        quantity: item.quantity,
      })),
    };

    createOrderMutate(orderData);
  };

  const startNewOrder = () => {
    setOrderPlaced(false);
    setCurrentOrderId("");
    setCart([]);
  };

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 text-center">
          <CardContent className="p-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">✅</span>
            </div>
            <h2 className="text-2xl font-bold text-green-600 mb-4">
              Order Placed!
            </h2>
            <div className="space-y-2 mb-6">
              <p className="text-lg font-semibold">
                Order ID: {currentOrderId}
              </p>
              <p className="text-lg font-semibold">Token: {userToken}</p>
              <p className="text-gray-600">
                Please remember your order ID and token number
              </p>
            </div>
            <Button
              onClick={startNewOrder}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
              Place New Order
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-xl">🍭</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Sweet Dreams Kiosk
                </h1>
                <p className="text-sm text-gray-600">
                  Select your sweets and place your order
                </p>
              </div>
            </div>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  size="lg"
                  className="relative bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  View Order
                  {getTotalItems() > 0 && (
                    <Badge className="absolute -top-2 -right-2 bg-yellow-500 text-black">
                      {getTotalItems()}
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
                            <h3 className="font-semibold text-lg">
                              {item.sweet.name}
                            </h3>
                            <p className="text-gray-600">
                              ₹{item.sweet.price} each
                            </p>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                updateQuantity(item.sweetId, item.quantity - 1)
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
                                updateQuantity(item.sweetId, item.quantity + 1)
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
                          <span className="font-semibold">
                            {getTotalItems()}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xl font-bold">
                          <span>Total Price:</span>
                          <span className="text-pink-600">
                            ₹{getTotalPrice().toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={placeOrder}
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
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search for sweets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 text-lg py-6"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48 text-lg py-6">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {categoryDisplayNames[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sweet Menu */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-white">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                Error Loading Data
              </h3>
              <p className="text-gray-500">
                Unable to fetch sweets from the database. Please try again
                later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSweets.map((sweet) => (
              <Card
                key={sweet.id}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-pink-300 bg-white"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2 text-gray-800">
                        {sweet.name}
                      </h3>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                        {categoryDisplayNames[sweet.category] || sweet.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-pink-600">
                        ₹{sweet.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sweet.quantity} KG available
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {sweet.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => addToCart(sweet)}
                    disabled={sweet.quantity === 0 || orderPending}
                    size="lg"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-lg py-6"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Order
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {filteredSweets.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">
              No sweets found matching your search.
            </p>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

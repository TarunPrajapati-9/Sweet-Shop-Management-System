import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getSweets } from "@/lib/dataGetter";
import { createOrder } from "@/lib/dataPoster";
import { toast } from "@/hooks/use-toast";

// Types
export interface Sweet {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  quantity: number;
}

export interface CartItem {
  sweetId: number;
  quantity: number;
  sweet: Sweet;
}

export const useSweetKiosk = () => {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
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
      ).toString();
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
      ).toString();
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
      ).toString();
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
      ).toString();
    }
  };

  // Fetch sweets data
  const { data, isLoading, error } = useQuery({
    queryKey: ["sweets"],
    queryFn: getSweets,
  });

  // Create order mutation
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

  // Cart functions
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

  return {
    // State
    sweets,
    cart,
    userToken,
    orderPlaced,
    currentOrderId,

    // Query states
    isLoading,
    error,
    orderPending,

    // Functions
    addToCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    placeOrder,
    startNewOrder,
    generateNewToken,
    setUserToken,
  };
};

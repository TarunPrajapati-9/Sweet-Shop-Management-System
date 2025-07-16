export interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  sweetId: number;
  orderId: string;
}

export interface Order {
  id: string; // e.g., ORD001
  token: number;
  status: "Pending" | "Completed";
  items: OrderItem[];
  total: number;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateOrderRequest {
  token: number;
  items: {
    sweetId: number;
    quantity: number;
  }[];
}

export interface UpdateOrderStatusRequest {
  status: "Pending" | "Completed";
}

// Prisma types for database operations
export interface OrderWithItems {
  id: string;
  token: number;
  status: "Pending" | "Completed";
  total: number;
  createdAt: Date;
  updatedAt: Date;
  items: {
    id: number;
    name: string;
    price: number;
    quantity: number;
    sweetId: number;
    sweet: {
      id: number;
      name: string;
      category: string;
      price: number;
    };
  }[];
}

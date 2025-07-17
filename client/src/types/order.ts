// Order-related type definitions

export interface OrderItem {
  sweetId: number;
  quantity: number;
  sweet?: Sweet;
}

export interface Sweet {
  id: number;
  name: string;
  price: number;
  description: string;
  category: string;
  inStock: number;
}

export interface Order {
  id: string;
  token: number;
  items: OrderItem[];
  status: OrderStatus;
  totalPrice: number;
  totalItems: number;
  createdAt: string;
  updatedAt: string;
}

export enum OrderStatus {
  PENDING = "pending",
  COMPLETED = "completed",
}

export interface CreateOrderRequest {
  token: number;
  items: Array<{
    sweetId: number;
    quantity: number;
  }>;
}

export interface CreateOrderResponse {
  success: boolean;
  message: string;
  data: Order;
}

export interface OrderStatusUpdateRequest {
  status: OrderStatus;
}

export interface OrderItemsUpdateRequest {
  items: Array<{
    sweetId: number;
    quantity: number;
  }>;
}

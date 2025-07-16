import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from "../types/order.type";
import { createResponse } from "../utils/response";

const prisma = new PrismaClient();

// Generate unique order ID (e.g., ORD001)
const generateOrderId = async (): Promise<string> => {
  let attempts = 0;
  const maxAttempts = 10;

  while (attempts < maxAttempts) {
    try {
      const lastOrder = await prisma.order.findFirst({
        orderBy: { createdAt: "desc" },
      });

      let nextNumber = 1;
      if (lastOrder) {
        const lastNumber = parseInt(lastOrder.id.replace("ORD", ""));
        nextNumber = lastNumber + 1;
      }

      const orderId = `ORD${nextNumber.toString().padStart(3, "0")}`;

      // Check if this ID already exists (for concurrent safety)
      const existingOrder = await prisma.order.findUnique({
        where: { id: orderId },
      });

      if (!existingOrder) {
        return orderId;
      }

      // If ID exists, increment and try again
      attempts++;
    } catch (error) {
      attempts++;
      if (attempts >= maxAttempts) {
        throw error;
      }
    }
  }

  // Fallback: use timestamp-based ID
  const timestamp = Date.now().toString().slice(-6);
  return `ORD${timestamp}`;
};

// Create a new order
export const createOrder = async (req: Request, res: Response) => {
  try {
    const { token, items }: CreateOrderRequest = req.body;

    // Validate input
    if (!token || !items || items.length === 0) {
      return res
        .status(400)
        .json(createResponse(false, "Token and items are required", null));
    }

    // Check if token is already in use
    const existingOrder = await prisma.order.findUnique({
      where: { token },
    });

    if (existingOrder) {
      return res
        .status(400)
        .json(createResponse(false, "Token already in use", null));
    }

    // Verify all sweets exist and have sufficient stock
    const sweetIds = items.map((item) => item.sweetId);
    const sweets = await prisma.sweet.findMany({
      where: { id: { in: sweetIds } },
    });

    if (sweets.length !== sweetIds.length) {
      return res
        .status(404)
        .json(createResponse(false, "One or more sweets not found", null));
    }

    // Check stock availability
    for (const item of items) {
      const sweet = sweets.find((s) => s.id === item.sweetId);
      if (!sweet || sweet.quantity < item.quantity) {
        return res
          .status(400)
          .json(
            createResponse(
              false,
              `Insufficient stock for ${sweet?.name || "sweet"}`,
              null
            )
          );
      }
    }

    // Generate unique order ID
    const orderId = await generateOrderId();

    // Calculate total
    let total = 0;
    const orderItems = items.map((item) => {
      const sweet = sweets.find((s) => s.id === item.sweetId)!;
      const itemTotal = sweet.price * item.quantity;
      total += itemTotal;

      return {
        name: sweet.name,
        price: sweet.price,
        quantity: item.quantity,
        sweetId: item.sweetId,
      };
    });

    // Create order with items in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          id: orderId,
          token,
          total,
          items: {
            create: orderItems,
          },
        },
        include: {
          items: {
            include: {
              sweet: true,
            },
          },
        },
      });

      // Update sweet quantities
      for (const item of items) {
        await tx.sweet.update({
          where: { id: item.sweetId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newOrder;
    });

    res
      .status(201)
      .json(createResponse(true, "Order created successfully", order));
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json(createResponse(false, "Failed to create order", null));
  }
};

// Get all orders
export const getOrders = async (req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            sweet: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(createResponse(true, "Orders retrieved successfully", orders));
  } catch (error) {
    console.error("Error getting orders:", error);
    res
      .status(500)
      .json(createResponse(false, "Failed to retrieve orders", null));
  }
};

// Get order by ID
export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            sweet: true,
          },
        },
      },
    });

    if (!order) {
      return res
        .status(404)
        .json(createResponse(false, "Order not found", null));
    }

    res.json(createResponse(true, "Order retrieved successfully", order));
  } catch (error) {
    console.error("Error getting order:", error);
    res
      .status(500)
      .json(createResponse(false, "Failed to retrieve order", null));
  }
};

// Get order by token
export const getOrderByToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    // Validate token is a valid number
    const tokenNumber = parseInt(token);
    if (isNaN(tokenNumber) || tokenNumber < 0) {
      return res
        .status(404)
        .json(createResponse(false, "Order not found", null));
    }

    const order = await prisma.order.findUnique({
      where: { token: tokenNumber },
      include: {
        items: {
          include: {
            sweet: true,
          },
        },
      },
    });

    if (!order) {
      return res
        .status(404)
        .json(createResponse(false, "Order not found", null));
    }

    res.json(createResponse(true, "Order retrieved successfully", order));
  } catch (error) {
    console.error("Error getting order:", error);
    res
      .status(500)
      .json(createResponse(false, "Failed to retrieve order", null));
  }
};

// Update order status
export const updateOrderStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status }: UpdateOrderStatusRequest = req.body;

    if (!status) {
      return res
        .status(400)
        .json(createResponse(false, "Status is required", null));
    }

    const validStatuses = ["Pending", "Completed"];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json(createResponse(false, "Invalid status", null));
    }

    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            sweet: true,
          },
        },
      },
    });

    res.json(createResponse(true, "Order status updated successfully", order));
  } catch (error: any) {
    console.error("Error updating order status:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json(createResponse(false, "Order not found", null));
    }
    res
      .status(500)
      .json(createResponse(false, "Failed to update order status", null));
  }
};

// Delete order (and restore stock)
export const deleteOrder = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Get order with items before deletion
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      return res
        .status(404)
        .json(createResponse(false, "Order not found", null));
    }

    // Delete order and restore stock in a transaction
    await prisma.$transaction(async (tx) => {
      // Restore sweet quantities
      for (const item of order.items) {
        await tx.sweet.update({
          where: { id: item.sweetId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      // Delete the order (items will be deleted due to cascade)
      await tx.order.delete({
        where: { id },
      });
    });

    res.json(
      createResponse(
        true,
        "Order deleted successfully and stock restored",
        null
      )
    );
  } catch (error: any) {
    console.error("Error deleting order:", error);
    if (error.code === "P2025") {
      return res
        .status(404)
        .json(createResponse(false, "Order not found", null));
    }
    res.status(500).json(createResponse(false, "Failed to delete order", null));
  }
};

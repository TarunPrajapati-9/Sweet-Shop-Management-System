import { Request, Response } from "express";
import { prisma } from "../utils/client";
import {
  CreateOrderRequest,
  UpdateOrderStatusRequest,
} from "../types/order.type";
import { createResponse } from "../utils/response";

/**
 * Converts BigInt fields to numbers in order objects for JSON serialization
 */
const serializeOrder = (order: any) => {
  if (!order) return order;
  
  return {
    ...order,
    token: Number(order.token), // Convert BigInt to number
    items: order.items?.map((item: any) => ({
      ...item,
      sweet: item.sweet ? {
        ...item.sweet,
        // Convert any BigInt fields in sweet if needed
      } : item.sweet
    }))
  };
};

/**
 * Generates a unique order ID in the format ORD001, ORD002, etc.
 * Implements retry logic for concurrent safety and fallback mechanism.
 *
 * @returns Promise<string> - Unique order ID
 */
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

/**
 * Creates a new order with the provided items and token.
 * Validates stock availability and creates order in a transaction.
 *
 * @param req - Express request object containing order data
 * @param res - Express response object
 */
export const createOrder = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token, items }: CreateOrderRequest = req.body;

    // Validate input
    if (!token || !items || items.length === 0) {
      res
        .status(400)
        .json(createResponse(false, "Token and items are required", null));
      return;
    }

    // Check if token is already in use
    const existingOrder = await prisma.order.findUnique({
      where: { token: BigInt(token) },
    });

    if (existingOrder) {
      res.status(400).json(createResponse(false, "Token already in use", null));
      return;
    }

    // Verify all sweets exist and have sufficient stock
    const sweetIds = items.map((item) => item.sweetId);
    const sweets = await prisma.sweet.findMany({
      where: { id: { in: sweetIds } },
    });

    if (sweets.length !== sweetIds.length) {
      res
        .status(404)
        .json(createResponse(false, "One or more sweets not found", null));
      return;
    }

    // Check stock availability
    for (const item of items) {
      const sweet = sweets.find((s) => s.id === item.sweetId);
      if (!sweet || sweet.quantity < item.quantity) {
        res
          .status(400)
          .json(
            createResponse(
              false,
              `Insufficient stock for ${sweet?.name || "sweet"}`,
              null
            )
          );
        return;
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
          token: BigInt(token),
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

    // Serialize the order for JSON response
    const serializedOrder = serializeOrder(order);

    res
      .status(201)
      .json(createResponse(true, "Order created successfully", serializedOrder));
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json(createResponse(false, "Failed to create order", null));
  }
};

/**
 * Retrieves all orders with their items and sweet details.
 * Orders are returned in descending order by creation date.
 *
 * @param req - Express request object
 * @param res - Express response object
 */
export const getOrders = async (req: Request, res: Response): Promise<void> => {
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

    // Serialize all orders for JSON response
    const serializedOrders = orders.map(order => serializeOrder(order));

    res.json(createResponse(true, "Orders retrieved successfully", serializedOrders));
  } catch (error) {
    console.error("Error getting orders:", error);
    res
      .status(500)
      .json(createResponse(false, "Failed to retrieve orders", null));
  }
};

/**
 * Retrieves a specific order by its ID with all related data.
 *
 * @param req - Express request object containing order ID in params
 * @param res - Express response object
 */
export const getOrderById = async (
  req: Request,
  res: Response
): Promise<void> => {
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
      res.status(404).json(createResponse(false, "Order not found", null));
      return;
    }

    // Serialize the order for JSON response
    const serializedOrder = serializeOrder(order);

    res.json(createResponse(true, "Order retrieved successfully", serializedOrder));
  } catch (error) {
    console.error("Error getting order:", error);
    res
      .status(500)
      .json(createResponse(false, "Failed to retrieve order", null));
  }
};

/**
 * Retrieves an order by its token number.
 *
 * @param req - Express request object containing token in params
 * @param res - Express response object
 */
export const getOrderByToken = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { token } = req.params;

    // Validate token is a valid number
    const tokenNumber = parseInt(token);
    if (isNaN(tokenNumber) || tokenNumber < 0) {
      res.status(404).json(createResponse(false, "Order not found", null));
      return;
    }

    const order = await prisma.order.findUnique({
      where: { token: BigInt(tokenNumber) },
      include: {
        items: {
          include: {
            sweet: true,
          },
        },
      },
    });

    if (!order) {
      res.status(404).json(createResponse(false, "Order not found", null));
      return;
    }

    // Serialize the order for JSON response
    const serializedOrder = serializeOrder(order);

    res.json(createResponse(true, "Order retrieved successfully", serializedOrder));
  } catch (error) {
    console.error("Error getting order:", error);
    res
      .status(500)
      .json(createResponse(false, "Failed to retrieve order", null));
  }
};

/**
 * Updates the status of an existing order.
 *
 * @param req - Express request object containing order ID and new status
 * @param res - Express response object
 */
export const updateOrderStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { status }: UpdateOrderStatusRequest = req.body;

    if (!status) {
      res.status(400).json(createResponse(false, "Status is required", null));
      return;
    }

    const validStatuses = ["Pending", "Completed"];
    if (!validStatuses.includes(status)) {
      res.status(400).json(createResponse(false, "Invalid status", null));
      return;
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

    // Serialize the order for JSON response
    const serializedOrder = serializeOrder(order);

    res.json(createResponse(true, "Order status updated successfully", serializedOrder));
  } catch (error: any) {
    console.error("Error updating order status:", error);
    if (error.code === "P2025") {
      res.status(404).json(createResponse(false, "Order not found", null));
      return;
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

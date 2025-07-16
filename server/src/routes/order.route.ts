import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  getOrderByToken,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/order.controller";

const router = Router();

// POST /api/orders - Create a new order
router.post("/", createOrder);

// GET /api/orders - Get all orders
router.get("/", getOrders);

// GET /api/orders/:id - Get order by ID
router.get("/:id", getOrderById);

// GET /api/orders/token/:token - Get order by token
router.get("/token/:token", getOrderByToken);

// PATCH /api/orders/:id/status - Update order status
router.patch("/:id/status", updateOrderStatus);

// DELETE /api/orders/:id - Delete order and restore stock
router.delete("/:id", deleteOrder);

export default router;

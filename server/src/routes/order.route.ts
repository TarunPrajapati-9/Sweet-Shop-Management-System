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

// POST /orders - Create a new order
router.post("/", createOrder);

// GET /orders - Get all orders
router.get("/", getOrders);

// GET /orders/:id - Get order by ID
router.get("/:id", getOrderById);

// GET /orders/token/:token - Get order by token
router.get("/token/:token", getOrderByToken);

// PATCH /orders/:id/status - Update order status
router.patch("/:id/status", updateOrderStatus);

// DELETE /orders/:id - Delete order and restore stock
router.delete("/:id", deleteOrder);

export default router;

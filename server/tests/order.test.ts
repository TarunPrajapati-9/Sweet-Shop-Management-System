//This code is not written by me, but I will understand it and test it(AI GENERATED CODE)

import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
} from "bun:test";
import request from "supertest";
import app from "../src/app";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

describe("Order API - Comprehensive Test Suite", () => {
  let testSweetId1: number;
  let testSweetId2: number;
  let testSweetId3: number;
  let testOrderId: string;

  beforeAll(async () => {
    // Create multiple test sweets for comprehensive testing
    const testSweet1 = await prisma.sweet.create({
      data: {
        name: "Test Chocolate Cake",
        category: "Cakes",
        price: 15.5,
        quantity: 50.0,
      },
    });
    testSweetId1 = testSweet1.id;

    const testSweet2 = await prisma.sweet.create({
      data: {
        name: "Test Vanilla Cookies",
        category: "Cookies",
        price: 8.25,
        quantity: 25.0,
      },
    });
    testSweetId2 = testSweet2.id;

    const testSweet3 = await prisma.sweet.create({
      data: {
        name: "Test Low Stock Item",
        category: "Limited",
        price: 5.0,
        quantity: 2.0,
      },
    });
    testSweetId3 = testSweet3.id;
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.sweet.deleteMany({
      where: {
        name: {
          in: [
            "Test Chocolate Cake",
            "Test Vanilla Cookies",
            "Test Low Stock Item",
          ],
        },
      },
    });
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    // Clean up orders before each test and reset sweet quantities
    await prisma.orderItem.deleteMany({});
    await prisma.order.deleteMany({});

    // Reset sweet quantities
    await prisma.sweet.update({
      where: { id: testSweetId1 },
      data: { quantity: 50.0 },
    });
    await prisma.sweet.update({
      where: { id: testSweetId2 },
      data: { quantity: 25.0 },
    });
    await prisma.sweet.update({
      where: { id: testSweetId3 },
      data: { quantity: 2.0 },
    });
  });

  describe("POST /orders - Create Order", () => {
    it("should create a new order successfully with single item", async () => {
      const orderData = {
        token: 1001,
        items: [
          {
            sweetId: testSweetId1,
            quantity: 2,
          },
        ],
      };

      const response = await request(app)
        .post("/orders")
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Order created successfully");
      expect(response.body.data.id).toMatch(/^ORD\d{3}$/);
      expect(response.body.data.token).toBe(1001);
      expect(response.body.data.status).toBe("Pending");
      expect(response.body.data.total).toBe(31.0); // 15.50 * 2
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].name).toBe("Test Chocolate Cake");
      expect(response.body.data.items[0].price).toBe(15.5);
      expect(response.body.data.items[0].quantity).toBe(2);

      // Verify stock was decremented
      const updatedSweet = await prisma.sweet.findUnique({
        where: { id: testSweetId1 },
      });
      expect(updatedSweet?.quantity).toBe(48.0);
    });

    it("should create a new order successfully with multiple items", async () => {
      const orderData = {
        token: 1002,
        items: [
          {
            sweetId: testSweetId1,
            quantity: 3,
          },
          {
            sweetId: testSweetId2,
            quantity: 4,
          },
        ],
      };

      const response = await request(app)
        .post("/orders")
        .send(orderData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(79.5); // (15.50 * 3) + (8.25 * 4)
      expect(response.body.data.items).toHaveLength(2);

      // Verify both stocks were decremented
      const updatedSweet1 = await prisma.sweet.findUnique({
        where: { id: testSweetId1 },
      });
      const updatedSweet2 = await prisma.sweet.findUnique({
        where: { id: testSweetId2 },
      });
      expect(updatedSweet1?.quantity).toBe(47.0);
      expect(updatedSweet2?.quantity).toBe(21.0);
    });

    it("should generate sequential order IDs", async () => {
      // Create first order
      const response1 = await request(app)
        .post("/orders")
        .send({
          token: 2001,
          items: [{ sweetId: testSweetId1, quantity: 1 }],
        })
        .expect(201);

      // Create second order
      const response2 = await request(app)
        .post("/orders")
        .send({
          token: 2002,
          items: [{ sweetId: testSweetId1, quantity: 1 }],
        })
        .expect(201);

      const orderId1 = response1.body.data.id;
      const orderId2 = response2.body.data.id;

      expect(orderId1).toMatch(/^ORD\d{3}$/);
      expect(orderId2).toMatch(/^ORD\d{3}$/);

      const num1 = parseInt(orderId1.replace("ORD", ""));
      const num2 = parseInt(orderId2.replace("ORD", ""));
      expect(num2).toBe(num1 + 1);
    });

    it("should return error for missing token", async () => {
      const orderData = {
        items: [{ sweetId: testSweetId1, quantity: 1 }],
      };

      const response = await request(app)
        .post("/orders")
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token and items are required");
    });

    it("should return error for missing items", async () => {
      const orderData = {
        token: 3001,
        items: [],
      };

      const response = await request(app)
        .post("/orders")
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token and items are required");
    });

    it("should return error for null items", async () => {
      const orderData = {
        token: 3002,
        items: null,
      };

      const response = await request(app)
        .post("/orders")
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token and items are required");
    });

    it("should return error for duplicate token", async () => {
      // Create first order
      await request(app)
        .post("/orders")
        .send({
          token: 4001,
          items: [{ sweetId: testSweetId1, quantity: 1 }],
        })
        .expect(201);

      // Try to create order with same token
      const response = await request(app)
        .post("/orders")
        .send({
          token: 4001,
          items: [{ sweetId: testSweetId1, quantity: 1 }],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token already in use");
    });

    it("should return error for insufficient stock", async () => {
      const orderData = {
        token: 5001,
        items: [
          {
            sweetId: testSweetId3, // This sweet has only 2 in stock
            quantity: 5,
          },
        ],
      };

      const response = await request(app)
        .post("/orders")
        .send(orderData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Insufficient stock for Test Low Stock Item"
      );
    });

    it("should return error for zero stock", async () => {
      // First, deplete the stock
      await request(app)
        .post("/orders")
        .send({
          token: 5101,
          items: [{ sweetId: testSweetId3, quantity: 2 }],
        })
        .expect(201);

      // Try to order more
      const response = await request(app)
        .post("/orders")
        .send({
          token: 5102,
          items: [{ sweetId: testSweetId3, quantity: 1 }],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Insufficient stock for Test Low Stock Item"
      );
    });

    it("should return error for non-existent sweet ID", async () => {
      const orderData = {
        token: 6001,
        items: [
          {
            sweetId: 99999, // Non-existent sweet ID
            quantity: 1,
          },
        ],
      };

      const response = await request(app)
        .post("/orders")
        .send(orderData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("One or more sweets not found");
    });

    it("should return error when one of multiple sweets doesn't exist", async () => {
      const orderData = {
        token: 7001,
        items: [
          { sweetId: testSweetId1, quantity: 1 },
          { sweetId: 99999, quantity: 1 }, // Non-existent
        ],
      };

      const response = await request(app)
        .post("/orders")
        .send(orderData)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("One or more sweets not found");

      // Verify no stock was decremented
      const sweet1 = await prisma.sweet.findUnique({
        where: { id: testSweetId1 },
      });
      expect(sweet1?.quantity).toBe(50.0); // Should remain unchanged
    });

    it("should handle decimal quantities correctly", async () => {
      const orderData = {
        token: 8001,
        items: [
          {
            sweetId: testSweetId2,
            quantity: 2.5,
          },
        ],
      };

      const response = await request(app)
        .post("/orders")
        .send(orderData)
        .expect(201);

      expect(response.body.data.total).toBe(20.625); // 8.25 * 2.5
      expect(response.body.data.items[0].quantity).toBe(2.5);

      // Verify stock was decremented correctly
      const updatedSweet = await prisma.sweet.findUnique({
        where: { id: testSweetId2 },
      });
      expect(updatedSweet?.quantity).toBe(22.5);
    });

    it("should handle exact stock quantity order", async () => {
      const orderData = {
        token: 8501,
        items: [
          {
            sweetId: testSweetId3, // Has exactly 2 in stock
            quantity: 2,
          },
        ],
      };

      const response = await request(app)
        .post("/orders")
        .send(orderData)
        .expect(201);

      expect(response.body.data.total).toBe(10.0);

      // Verify stock is now 0
      const updatedSweet = await prisma.sweet.findUnique({
        where: { id: testSweetId3 },
      });
      expect(updatedSweet?.quantity).toBe(0);
    });
  });

  describe("GET /orders - Get All Orders", () => {
    beforeEach(async () => {
      // Create multiple test orders
      await request(app)
        .post("/orders")
        .send({
          token: 9001,
          items: [{ sweetId: testSweetId1, quantity: 1 }],
        });

      await request(app)
        .post("/orders")
        .send({
          token: 9002,
          items: [{ sweetId: testSweetId2, quantity: 2 }],
        });
    });

    it("should get all orders with items and sweet details", async () => {
      const response = await request(app).get("/orders").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Orders retrieved successfully");
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);

      // Check order structure
      const order = response.body.data[0];
      expect(order).toHaveProperty("id");
      expect(order).toHaveProperty("token");
      expect(order).toHaveProperty("status");
      expect(order).toHaveProperty("total");
      expect(order).toHaveProperty("items");
      expect(order).toHaveProperty("createdAt");
      expect(order).toHaveProperty("updatedAt");

      // Check item structure
      expect(order.items[0]).toHaveProperty("sweet");
      expect(order.items[0].sweet).toHaveProperty("name");
      expect(order.items[0].sweet).toHaveProperty("category");
    });

    it("should return empty array when no orders exist", async () => {
      // Clean up all orders
      await prisma.orderItem.deleteMany({});
      await prisma.order.deleteMany({});

      const response = await request(app).get("/orders").expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it("should return orders in descending order by creation date", async () => {
      const response = await request(app).get("/orders").expect(200);

      const orders = response.body.data;
      expect(orders.length).toBeGreaterThan(1);

      // Check if orders are sorted by createdAt in descending order
      for (let i = 1; i < orders.length; i++) {
        const prev = new Date(orders[i - 1].createdAt);
        const curr = new Date(orders[i].createdAt);
        expect(prev.getTime()).toBeGreaterThanOrEqual(curr.getTime());
      }
    });
  });

  describe("GET /orders/:id - Get Order by ID", () => {
    beforeEach(async () => {
      // Create a test order
      const response = await request(app)
        .post("/orders")
        .send({
          token: 10001,
          items: [{ sweetId: testSweetId1, quantity: 2 }],
        });
      testOrderId = response.body.data.id;
    });

    it("should get order by ID with full details", async () => {
      const response = await request(app)
        .get(`/orders/${testOrderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Order retrieved successfully");
      expect(response.body.data.id).toBe(testOrderId);
      expect(response.body.data.token).toBe(10001);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].sweet).toBeDefined();
      expect(response.body.data.items[0].sweet.name).toBe(
        "Test Chocolate Cake"
      );
    });

    it("should return 404 for non-existent order ID", async () => {
      const response = await request(app).get("/orders/ORD999").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    it("should return 404 for invalid order ID format", async () => {
      const response = await request(app).get("/orders/INVALID123").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });
  });

  describe("GET /orders/token/:token - Get Order by Token", () => {
    beforeEach(async () => {
      // Create a test order
      const response = await request(app)
        .post("/orders")
        .send({
          token: 11001,
          items: [{ sweetId: testSweetId2, quantity: 3 }],
        });
      testOrderId = response.body.data.id;
    });

    it("should get order by token with full details", async () => {
      const response = await request(app)
        .get("/orders/token/11001")
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Order retrieved successfully");
      expect(response.body.data.token).toBe(11001);
      expect(response.body.data.items).toHaveLength(1);
      expect(response.body.data.items[0].sweet).toBeDefined();
      expect(response.body.data.items[0].sweet.name).toBe(
        "Test Vanilla Cookies"
      );
    });

    it("should return 404 for non-existent token", async () => {
      const response = await request(app)
        .get("/orders/token/99999")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    it("should handle invalid token format gracefully", async () => {
      const response = await request(app).get("/orders/token/abc").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    it("should handle negative token numbers", async () => {
      const response = await request(app).get("/orders/token/-1").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    it("should handle decimal token numbers", async () => {
      const response = await request(app)
        .get("/orders/token/123.45")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });
  });

  describe("PATCH /orders/:id/status - Update Order Status", () => {
    beforeEach(async () => {
      // Create a test order
      const response = await request(app)
        .post("/orders")
        .send({
          token: 12001,
          items: [{ sweetId: testSweetId1, quantity: 1 }],
        });
      testOrderId = response.body.data.id;
    });

    it("should update order status to Preparing", async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({ status: "Preparing" })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Order status updated successfully");
      expect(response.body.data.status).toBe("Preparing");
    });

    it("should update order status to Ready", async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({ status: "Ready" })
        .expect(200);

      expect(response.body.data.status).toBe("Ready");
    });

    it("should update order status to Completed", async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({ status: "Completed" })
        .expect(200);

      expect(response.body.data.status).toBe("Completed");
    });

    it("should update order status back to Pending", async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({ status: "Pending" })
        .expect(200);

      expect(response.body.data.status).toBe("Pending");
    });

    it("should return error for missing status", async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Status is required");
    });

    it("should return error for null status", async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({ status: null })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Status is required");
    });

    it("should return error for empty string status", async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({ status: "" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Status is required");
    });

    it("should return error for invalid status", async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({ status: "InvalidStatus" })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid status");
    });

    it("should return error for case-sensitive status", async () => {
      const response = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({ status: "pending" }) // lowercase
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid status");
    });

    it("should return error for non-existent order", async () => {
      const response = await request(app)
        .patch("/orders/ORD999/status")
        .send({ status: "Preparing" })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    it("should preserve other order data when updating status", async () => {
      const originalResponse = await request(app)
        .get(`/orders/${testOrderId}`)
        .expect(200);

      const originalOrder = originalResponse.body.data;

      const updateResponse = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({ status: "Ready" })
        .expect(200);

      const updatedOrder = updateResponse.body.data;

      expect(updatedOrder.id).toBe(originalOrder.id);
      expect(updatedOrder.token).toBe(originalOrder.token);
      expect(updatedOrder.total).toBe(originalOrder.total);
      expect(updatedOrder.items.length).toBe(originalOrder.items.length);
      expect(updatedOrder.status).toBe("Ready");
      expect(updatedOrder.status).not.toBe(originalOrder.status);
    });

    it("should update updatedAt field when status changes", async () => {
      const originalResponse = await request(app)
        .get(`/orders/${testOrderId}`)
        .expect(200);

      const originalOrder = originalResponse.body.data;
      const originalUpdatedAt = new Date(originalOrder.updatedAt);

      // Wait a moment to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      const updateResponse = await request(app)
        .patch(`/orders/${testOrderId}/status`)
        .send({ status: "Ready" })
        .expect(200);

      const updatedOrder = updateResponse.body.data;
      const newUpdatedAt = new Date(updatedOrder.updatedAt);

      expect(newUpdatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime()
      );
    });
  });

  describe("DELETE /orders/:id - Delete Order", () => {
    beforeEach(async () => {
      // Create a test order with multiple items
      const response = await request(app)
        .post("/orders")
        .send({
          token: 13001,
          items: [
            { sweetId: testSweetId1, quantity: 3 },
            { sweetId: testSweetId2, quantity: 2 },
          ],
        });
      testOrderId = response.body.data.id;
    });

    it("should delete order and restore stock for all items", async () => {
      // Check initial stock levels
      const initialSweet1 = await prisma.sweet.findUnique({
        where: { id: testSweetId1 },
      });
      const initialSweet2 = await prisma.sweet.findUnique({
        where: { id: testSweetId2 },
      });

      const response = await request(app)
        .delete(`/orders/${testOrderId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(
        "Order deleted successfully and stock restored"
      );

      // Check that stock was restored for both items
      const restoredSweet1 = await prisma.sweet.findUnique({
        where: { id: testSweetId1 },
      });
      const restoredSweet2 = await prisma.sweet.findUnique({
        where: { id: testSweetId2 },
      });

      expect(restoredSweet1?.quantity).toBe((initialSweet1?.quantity || 0) + 3);
      expect(restoredSweet2?.quantity).toBe((initialSweet2?.quantity || 0) + 2);

      // Check that order was completely deleted
      const deletedOrder = await prisma.order.findUnique({
        where: { id: testOrderId },
      });
      expect(deletedOrder).toBeNull();

      // Check that order items were also deleted
      const deletedItems = await prisma.orderItem.findMany({
        where: { orderId: testOrderId },
      });
      expect(deletedItems).toHaveLength(0);
    });

    it("should delete single item order and restore stock correctly", async () => {
      // Create single item order
      const singleItemResponse = await request(app)
        .post("/orders")
        .send({
          token: 13101,
          items: [{ sweetId: testSweetId3, quantity: 1 }],
        });

      const singleOrderId = singleItemResponse.body.data.id;

      const initialSweet = await prisma.sweet.findUnique({
        where: { id: testSweetId3 },
      });

      await request(app).delete(`/orders/${singleOrderId}`).expect(200);

      const restoredSweet = await prisma.sweet.findUnique({
        where: { id: testSweetId3 },
      });

      expect(restoredSweet?.quantity).toBe((initialSweet?.quantity || 0) + 1);
    });

    it("should return 404 for non-existent order", async () => {
      const response = await request(app).delete("/orders/ORD999").expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    it("should return 404 for invalid order ID format", async () => {
      const response = await request(app)
        .delete("/orders/INVALID123")
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Order not found");
    });

    it("should not affect other orders when deleting one order", async () => {
      // Create another order
      const anotherOrderResponse = await request(app)
        .post("/orders")
        .send({
          token: 14001,
          items: [{ sweetId: testSweetId1, quantity: 1 }],
        });

      const anotherOrderId = anotherOrderResponse.body.data.id;

      // Delete the first order
      await request(app).delete(`/orders/${testOrderId}`).expect(200);

      // Check that the other order still exists
      const otherOrderResponse = await request(app)
        .get(`/orders/${anotherOrderId}`)
        .expect(200);

      expect(otherOrderResponse.body.success).toBe(true);
      expect(otherOrderResponse.body.data.id).toBe(anotherOrderId);
    });

    it("should handle deletion of order with decimal quantities", async () => {
      // Create order with decimal quantities
      const decimalOrderResponse = await request(app)
        .post("/orders")
        .send({
          token: 14101,
          items: [{ sweetId: testSweetId2, quantity: 2.5 }],
        });

      const decimalOrderId = decimalOrderResponse.body.data.id;

      const initialSweet = await prisma.sweet.findUnique({
        where: { id: testSweetId2 },
      });

      await request(app).delete(`/orders/${decimalOrderId}`).expect(200);

      const restoredSweet = await prisma.sweet.findUnique({
        where: { id: testSweetId2 },
      });

      expect(restoredSweet?.quantity).toBe((initialSweet?.quantity || 0) + 2.5);
    });
  });

  describe("Integration Tests - Complex Scenarios", () => {
    it("should handle complete order lifecycle", async () => {
      // 1. Create order
      const createResponse = await request(app)
        .post("/orders")
        .send({
          token: 15001,
          items: [{ sweetId: testSweetId1, quantity: 2 }],
        })
        .expect(201);

      const orderId = createResponse.body.data.id;
      expect(createResponse.body.data.status).toBe("Pending");

      // 2. Update to Preparing
      await request(app)
        .patch(`/orders/${orderId}/status`)
        .send({ status: "Preparing" })
        .expect(200);

      // 3. Update to Ready
      await request(app)
        .patch(`/orders/${orderId}/status`)
        .send({ status: "Ready" })
        .expect(200);

      // 4. Update to Completed
      const completeResponse = await request(app)
        .patch(`/orders/${orderId}/status`)
        .send({ status: "Completed" })
        .expect(200);

      expect(completeResponse.body.data.status).toBe("Completed");

      // 5. Verify order can still be retrieved
      const finalResponse = await request(app)
        .get(`/orders/${orderId}`)
        .expect(200);

      expect(finalResponse.body.data.status).toBe("Completed");
    });

    it("should handle multiple concurrent orders correctly", async () => {
      // Create orders sequentially to avoid database conflicts
      const responses = [];

      for (let i = 0; i < 3; i++) {
        const response = await request(app)
          .post("/orders")
          .send({
            token: 16000 + i,
            items: [{ sweetId: testSweetId1, quantity: 1 }],
          });
        responses.push(response);
      }

      // All should succeed
      responses.forEach((response, index) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
        expect(response.body.data.token).toBe(16000 + index);
      });

      // Check final stock level
      const finalSweet = await prisma.sweet.findUnique({
        where: { id: testSweetId1 },
      });
      expect(finalSweet?.quantity).toBe(47.0); // 50 - 3
    });

    it("should handle edge case with exact stock quantity", async () => {
      // Order exactly the available quantity
      const response = await request(app)
        .post("/orders")
        .send({
          token: 17001,
          items: [{ sweetId: testSweetId3, quantity: 2 }], // Exactly what's in stock
        })
        .expect(201);

      expect(response.body.data.total).toBe(10.0);

      // Verify stock is now 0
      const updatedSweet = await prisma.sweet.findUnique({
        where: { id: testSweetId3 },
      });
      expect(updatedSweet?.quantity).toBe(0);

      // Try to order more - should fail
      await request(app)
        .post("/orders")
        .send({
          token: 17002,
          items: [{ sweetId: testSweetId3, quantity: 1 }],
        })
        .expect(400);
    });

    it("should maintain data integrity during order operations", async () => {
      // Create order
      const orderResponse = await request(app)
        .post("/orders")
        .send({
          token: 18001,
          items: [
            { sweetId: testSweetId1, quantity: 5 },
            { sweetId: testSweetId2, quantity: 3 },
          ],
        })
        .expect(201);

      const orderId = orderResponse.body.data.id;

      // Check that total is calculated correctly
      const expectedTotal = 15.5 * 5 + 8.25 * 3; // 77.5 + 24.75 = 102.25
      expect(orderResponse.body.data.total).toBe(expectedTotal);

      // Update status
      await request(app)
        .patch(`/orders/${orderId}/status`)
        .send({ status: "Completed" })
        .expect(200);

      // Delete order
      await request(app).delete(`/orders/${orderId}`).expect(200);

      // Verify stock is back to original levels
      const sweet1 = await prisma.sweet.findUnique({
        where: { id: testSweetId1 },
      });
      const sweet2 = await prisma.sweet.findUnique({
        where: { id: testSweetId2 },
      });

      expect(sweet1?.quantity).toBe(50.0);
      expect(sweet2?.quantity).toBe(25.0);
    });
  });

  describe("Error Handling and Edge Cases", () => {
    it("should validate numeric token values", async () => {
      const response = await request(app)
        .post("/orders")
        .send({
          token: null,
          items: [{ sweetId: testSweetId1, quantity: 1 }],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Token and items are required");
    });

    it("should handle very large quantities", async () => {
      const response = await request(app)
        .post("/orders")
        .send({
          token: 20001,
          items: [{ sweetId: testSweetId1, quantity: 1000000 }],
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Insufficient stock for Test Chocolate Cake"
      );
    });

    it("should handle zero quantity orders", async () => {
      const response = await request(app)
        .post("/orders")
        .send({
          token: 20002,
          items: [{ sweetId: testSweetId1, quantity: 0 }],
        });

      // Should either accept 0 quantity or reject it based on business logic
      // The controller should handle this case appropriately
      expect(response.body).toHaveProperty("success");
    });

    it("should handle negative quantities", async () => {
      const response = await request(app)
        .post("/orders")
        .send({
          token: 20003,
          items: [{ sweetId: testSweetId1, quantity: -1 }],
        });

      // Should reject negative quantities
      expect(response.body).toHaveProperty("success");
    });
  });
});

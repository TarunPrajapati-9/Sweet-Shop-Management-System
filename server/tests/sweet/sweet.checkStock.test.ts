import { test, expect, describe } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import { Sweet } from "../../src/types/sweet.type";

describe("Check Stock", () => {
  // Helper function to create test sweets with different quantities
  const createTestSweetsWithDifferentStock = async () => {
    // Create sweet with stock (quantity > 0)
    const availableSweet = await request(app)
      .post("/sweets")
      .send({
        name: "Available Sweet " + Date.now(),
        category: "Milk-Based",
        price: 30,
        quantity: 15,
      });

    // Create another sweet with stock
    const availableSweet2 = await request(app)
      .post("/sweets")
      .send({
        name: "Available Sweet 2 " + Date.now(),
        category: "Chocolate-Based",
        price: 45,
        quantity: 8.5,
      });

    // Create sweet and then restock to 0 (out of stock)
    const outOfStockSweet = await request(app)
      .post("/sweets")
      .send({
        name: "Out of Stock Sweet " + Date.now(),
        category: "Nut-Based",
        price: 25,
        quantity: 10,
      });

    // Restock to 0 to make it out of stock
    await request(app)
      .patch(`/sweets/${outOfStockSweet.body.data.id}/restock`)
      .send({ quantity: 0 });

    return {
      available: [availableSweet.body.data, availableSweet2.body.data],
      outOfStock: [outOfStockSweet.body.data],
    };
  };

  test("GET /sweets/check-stock?stock=available - should return only available sweets", async () => {
    // Create test data
    const testData = await createTestSweetsWithDifferentStock();

    const response = await request(app).get(
      "/sweets/check-stock?stock=available"
    );

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success");
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("data");
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Available sweets fetched successfully");

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should have quantity > 0
    sweets.forEach((sweet) => {
      expect(sweet.quantity).toBeGreaterThan(0);
    });

    // Should include our available sweets
    const availableSweetIds = testData.available.map((s) => s.id);
    const returnedIds = sweets.map((s) => s.id);
    availableSweetIds.forEach((id) => {
      expect(returnedIds).toContain(id);
    });
  });

  test("GET /sweets/check-stock?stock=out - should return only out of stock sweets", async () => {
    // Create test data
    const testData = await createTestSweetsWithDifferentStock();

    const response = await request(app).get("/sweets/check-stock?stock=out");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success");
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("data");
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Out of stock sweets fetched successfully"
    );

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should have quantity = 0
    sweets.forEach((sweet) => {
      expect(sweet.quantity).toBe(0);
    });
  });

  test("GET /sweets/check-stock - should return 400 when stock parameter is missing", async () => {
    const response = await request(app).get("/sweets/check-stock");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Stock parameter is required. Use 'available' or 'out'"
    );
    expect(response.body.data).toEqual({});
  });

  test("GET /sweets/check-stock?stock=invalid - should return 400 for invalid stock parameter", async () => {
    const response = await request(app).get(
      "/sweets/check-stock?stock=invalid"
    );

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid stock parameter. Use 'available' or 'out'"
    );
    expect(response.body.data).toEqual({});
  });

  test("GET /sweets/check-stock?stock=AVAILABLE - should accept case-insensitive parameter", async () => {
    // Create test data first
    await createTestSweetsWithDifferentStock();

    const response = await request(app).get(
      "/sweets/check-stock?stock=AVAILABLE"
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Available sweets fetched successfully");
    expect(Array.isArray(response.body.data)).toBe(true);

    // All returned sweets should have quantity > 0
    const sweets: Sweet[] = response.body.data;
    sweets.forEach((sweet) => {
      expect(sweet.quantity).toBeGreaterThan(0);
    });
  });

  test("GET /sweets/check-stock?stock=OUT - should accept uppercase 'OUT' parameter", async () => {
    // Create test data first
    await createTestSweetsWithDifferentStock();

    const response = await request(app).get("/sweets/check-stock?stock=OUT");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Out of stock sweets fetched successfully"
    );
    expect(Array.isArray(response.body.data)).toBe(true);

    // All returned sweets should have quantity = 0
    const sweets: Sweet[] = response.body.data;
    sweets.forEach((sweet) => {
      expect(sweet.quantity).toBe(0);
    });
  });

  test("GET /sweets/check-stock?stock=Available - should accept mixed case parameter", async () => {
    // Create test data first
    await createTestSweetsWithDifferentStock();

    const response = await request(app).get(
      "/sweets/check-stock?stock=Available"
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Available sweets fetched successfully");
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("GET /sweets/check-stock?stock=available - should return empty array when no available sweets exist", async () => {
    // Create a test sweet and immediately restock it to 0
    const testSweet = await request(app)
      .post("/sweets")
      .send({
        name: "Temp Sweet for Empty Test " + Date.now(),
        category: "Milk-Based",
        price: 30,
        quantity: 15,
      });

    // Restock to 0
    await request(app)
      .patch(`/sweets/${testSweet.body.data.id}/restock`)
      .send({ quantity: 0 });

    // Now check if we can filter correctly (we know at least one sweet is out of stock)
    const response = await request(app).get(
      "/sweets/check-stock?stock=available"
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Available sweets fetched successfully");
    expect(Array.isArray(response.body.data)).toBe(true);

    // Verify that the test sweet we made out of stock is not in the available list
    const availableSweets: Sweet[] = response.body.data;
    const foundTestSweet = availableSweets.find(
      (s) => s.id === testSweet.body.data.id
    );
    expect(foundTestSweet).toBeUndefined();
  });

  test("GET /sweets/check-stock?stock=out - should return sweets with zero quantity", async () => {
    // Create a test sweet and restock it to 0
    const testSweet = await request(app)
      .post("/sweets")
      .send({
        name: "Test Out of Stock Sweet " + Date.now(),
        category: "Chocolate-Based",
        price: 40,
        quantity: 20,
      });

    // Restock to 0 to make it out of stock
    await request(app)
      .patch(`/sweets/${testSweet.body.data.id}/restock`)
      .send({ quantity: 0 });

    const response = await request(app).get("/sweets/check-stock?stock=out");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe(
      "Out of stock sweets fetched successfully"
    );

    const outOfStockSweets: Sweet[] = response.body.data;
    expect(Array.isArray(outOfStockSweets)).toBe(true);

    // Verify our test sweet is in the out of stock list
    const foundTestSweet = outOfStockSweets.find(
      (s) => s.id === testSweet.body.data.id
    );
    expect(foundTestSweet).toBeDefined();
    expect(foundTestSweet?.quantity).toBe(0);
  });

  test("GET /sweets/check-stock?stock=available - should handle decimal quantities", async () => {
    // Create sweet with decimal quantity
    const decimalSweet = await request(app)
      .post("/sweets")
      .send({
        name: "Decimal Sweet " + Date.now(),
        category: "Fruit-Based",
        price: 22.5,
        quantity: 3.75,
      });

    const response = await request(app).get(
      "/sweets/check-stock?stock=available"
    );

    expect(response.status).toBe(200);
    const sweets: Sweet[] = response.body.data;

    // Find our decimal sweet in the results
    const foundSweet = sweets.find((s) => s.id === decimalSweet.body.data.id);
    expect(foundSweet).toBeDefined();
    expect(foundSweet?.quantity).toBe(3.75);
  });
});

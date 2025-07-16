import { test, expect, describe } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import { Sweet } from "../../src/types/sweet.type";
import { restockRequests } from "./fixtures/sweet.fixtures";

describe("Restock Sweet", () => {
  // Helper function to create a sweet for testing restock
  const createTestSweet = async () => {
    const response = await request(app)
      .post("/sweets")
      .send({
        name: "Test Sweet for Restock " + Date.now(), // Ensure uniqueness
        category: "Milk-Based",
        price: 30,
        quantity: 15,
      });

    expect(response.status).toBe(201);
    return response.body.data;
  };

  test("PATCH /sweets/:id/restock - should restock an existing sweet successfully", async () => {
    // First create a sweet to restock
    const originalSweet = await createTestSweet();

    // Now restock the sweet
    const restockResponse = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send(restockRequests.validRestock);

    expect(restockResponse.status).toBe(200);
    expect(restockResponse.body).toHaveProperty("success");
    expect(restockResponse.body).toHaveProperty("message");
    expect(restockResponse.body).toHaveProperty("data");
    expect(restockResponse.body.success).toBe(true);
    expect(restockResponse.body.message).toBe("Sweet restocked successfully");

    const restockedSweet: Sweet = restockResponse.body.data;
    expect(restockedSweet.id).toBe(originalSweet.id);
    expect(restockedSweet.quantity).toBe(restockRequests.validRestock.quantity);
    // Verify other fields remain unchanged
    expect(restockedSweet.name).toBe(originalSweet.name);
    expect(restockedSweet.category).toBe(originalSweet.category);
    expect(restockedSweet.price).toBe(originalSweet.price);
  });

  test("PATCH /sweets/:id/restock - should return 404 for non-existent sweet", async () => {
    const nonExistentId = 99999;

    const response = await request(app)
      .patch(`/sweets/${nonExistentId}/restock`)
      .send(restockRequests.validRestock);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
    expect(response.body.data).toEqual({});
  });

  test("PATCH /sweets/:id/restock - should return 404 for invalid ID format", async () => {
    const invalidId = "not-a-number";

    const response = await request(app)
      .patch(`/sweets/${invalidId}/restock`)
      .send(restockRequests.validRestock);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
  });

  test("PATCH /sweets/:id/restock - should return 400 for missing quantity", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send(restockRequests.missingQuantity);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Quantity is required");
  });

  test("PATCH /sweets/:id/restock - should return 400 for invalid data type", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send(restockRequests.invalidDataType);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Quantity must be a number");
  });

  test("PATCH /sweets/:id/restock - should return 400 for negative quantity", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send(restockRequests.negativeQuantity);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Quantity must be greater than or equal to 0"
    );
  });

  test("PATCH /sweets/:id/restock - should allow zero quantity (out of stock)", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send(restockRequests.zeroRestock);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Sweet restocked successfully");

    const restockedSweet: Sweet = response.body.data;
    expect(restockedSweet.quantity).toBe(0);
  });

  test("PATCH /sweets/:id/restock - should handle large quantity values", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send(restockRequests.largeRestock);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    const restockedSweet: Sweet = response.body.data;
    expect(restockedSweet.quantity).toBe(restockRequests.largeRestock.quantity);
  });

  test("PATCH /sweets/:id/restock - should return 400 for null quantity", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send(restockRequests.nullQuantity);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Quantity is required");
  });

  test("PATCH /sweets/:id/restock - should handle zero ID", async () => {
    const response = await request(app)
      .patch("/sweets/0/restock")
      .send(restockRequests.validRestock);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
  });

  test("PATCH /sweets/:id/restock - should handle negative ID", async () => {
    const response = await request(app)
      .patch("/sweets/-1/restock")
      .send(restockRequests.validRestock);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
  });

  test("PATCH /sweets/:id/restock - should handle decimal ID (convert to integer)", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .patch(`/sweets/${originalSweet.id}.5/restock`)
      .send(restockRequests.validRestock);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Sweet restocked successfully");
  });

  test("PATCH /sweets/:id/restock - should verify restock persists in database", async () => {
    const originalSweet = await createTestSweet();
    const newQuantity = 75;

    // Restock the sweet
    const restockResponse = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send({ quantity: newQuantity });

    expect(restockResponse.status).toBe(200);

    // Fetch all sweets to verify the restock persisted
    const allSweetsResponse = await request(app).get("/sweets");
    const allSweets = allSweetsResponse.body.data;

    const restockedSweetInDb = allSweets.find(
      (sweet: Sweet) => sweet.id === originalSweet.id
    );
    expect(restockedSweetInDb).toBeDefined();
    expect(restockedSweetInDb.quantity).toBe(newQuantity);
    // Verify other fields remain unchanged
    expect(restockedSweetInDb.name).toBe(originalSweet.name);
    expect(restockedSweetInDb.category).toBe(originalSweet.category);
    expect(restockedSweetInDb.price).toBe(originalSweet.price);
  });

  test("PATCH /sweets/:id/restock - should handle empty request body", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Quantity is required");
  });

  test("PATCH /sweets/:id/restock - should handle decimal quantity values", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send({ quantity: 25.5 });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    const restockedSweet: Sweet = response.body.data;
    expect(restockedSweet.quantity).toBe(25.5);
  });

  test("PATCH /sweets/:id/restock - should only update quantity, not other fields", async () => {
    const originalSweet = await createTestSweet();

    // Try to send other fields along with quantity
    const response = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send({
        quantity: 100,
        name: "Hacked Name",
        price: 999,
        category: "Hacked Category",
      });

    expect(response.status).toBe(200);
    const restockedSweet: Sweet = response.body.data;

    // Only quantity should change
    expect(restockedSweet.quantity).toBe(100);
    // Other fields should remain unchanged
    expect(restockedSweet.name).toBe(originalSweet.name);
    expect(restockedSweet.price).toBe(originalSweet.price);
    expect(restockedSweet.category).toBe(originalSweet.category);
  });

  test("PATCH /sweets/:id/restock - should restock with small decimal quantity", async () => {
    // First create a sweet to restock
    const originalSweet = await createTestSweet();

    // Restock with small decimal quantity
    const restockResponse = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send({ quantity: 0.75 });

    expect(restockResponse.status).toBe(200);
    expect(restockResponse.body.success).toBe(true);
    expect(restockResponse.body.message).toBe("Sweet restocked successfully");

    const restockedSweet: Sweet = restockResponse.body.data;
    expect(restockedSweet.quantity).toBe(0.75);
    // Verify other fields remain unchanged
    expect(restockedSweet.name).toBe(originalSweet.name);
    expect(restockedSweet.category).toBe(originalSweet.category);
    expect(restockedSweet.price).toBe(originalSweet.price);
  });

  test("PATCH /sweets/:id/restock - should restock with precise decimal quantity", async () => {
    // First create a sweet to restock
    const originalSweet = await createTestSweet();

    // Restock with precise decimal quantity
    const restockResponse = await request(app)
      .patch(`/sweets/${originalSweet.id}/restock`)
      .send({ quantity: 15.125 });

    expect(restockResponse.status).toBe(200);
    expect(restockResponse.body.success).toBe(true);

    const restockedSweet: Sweet = restockResponse.body.data;
    expect(restockedSweet.quantity).toBe(15.125);
    // Verify other fields remain unchanged
    expect(restockedSweet.name).toBe(originalSweet.name);
    expect(restockedSweet.category).toBe(originalSweet.category);
    expect(restockedSweet.price).toBe(originalSweet.price);
  });
});

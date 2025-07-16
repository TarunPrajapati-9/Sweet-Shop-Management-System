import { test, expect, describe } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import { Sweet } from "../../src/types/sweet.type";
import {
  invalidSweetRequests,
  updateSweetRequests,
} from "./fixtures/sweet.fixtures";

describe("Update Sweet", () => {
  // Helper function to create a sweet for testing updates
  const createTestSweet = async () => {
    const response = await request(app)
      .post("/sweets")
      .send({
        name: "Test Sweet for Update " + Date.now(), // Ensure uniqueness
        category: "Milk-Based",
        price: 30,
        quantity: 15,
      });

    expect(response.status).toBe(201);
    return response.body.data;
  };

  test("PUT /sweets/:id - should update an existing sweet successfully", async () => {
    // First create a sweet to update
    const originalSweet = await createTestSweet();

    // Use dynamic name to avoid conflicts
    const updateData = {
      name: "Successfully Updated Sweet " + Date.now(),
      category: "Chocolate-Based",
      price: 55,
      quantity: 30,
    };

    // Now update the sweet
    const updateResponse = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(updateData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body).toHaveProperty("success");
    expect(updateResponse.body).toHaveProperty("message");
    expect(updateResponse.body).toHaveProperty("data");
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.message).toBe("Sweet updated successfully");

    const updatedSweet: Sweet = updateResponse.body.data;
    expect(updatedSweet.id).toBe(originalSweet.id);
    expect(updatedSweet.name).toBe(updateData.name);
    expect(updatedSweet.category).toBe(updateData.category);
    expect(updatedSweet.price).toBe(updateData.price);
    expect(updatedSweet.quantity).toBe(updateData.quantity);
    // Verify the sweet was actually updated (different from original)
    expect(updatedSweet.name).not.toBe(originalSweet.name);
  });

  test("PUT /sweets/:id - should return 404 for non-existent sweet", async () => {
    const nonExistentId = 99999;

    // Use dynamic name to avoid conflicts
    const updateData = {
      name: "Non-existent Sweet Update " + Date.now(),
      category: "Chocolate-Based",
      price: 55,
      quantity: 30,
    };

    const response = await request(app)
      .put(`/sweets/${nonExistentId}`)
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
    expect(response.body.data).toEqual({});
  });

  test("PUT /sweets/:id - should return 404 for invalid ID format", async () => {
    const invalidId = "not-a-number";

    // Use dynamic name to avoid conflicts
    const updateData = {
      name: "Invalid ID Update " + Date.now(),
      category: "Chocolate-Based",
      price: 55,
      quantity: 30,
    };

    const response = await request(app)
      .put(`/sweets/${invalidId}`)
      .send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
  });

  test("PUT /sweets/:id - should return 400 for missing required fields", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(invalidSweetRequests.missingFields);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      "All fields (name, category, price, quantity) are required"
    );
  });

  test("PUT /sweets/:id - should return 400 for invalid data types", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(invalidSweetRequests.invalidDataTypes);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Name must be a string");
  });

  test("PUT /sweets/:id - should return 400 for invalid category", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(invalidSweetRequests.invalidCategory);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Invalid category");
  });

  test("PUT /sweets/:id - should return 400 for negative price", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(invalidSweetRequests.negativePrice);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Price must be greater than 0");
  });

  test("PUT /sweets/:id - should return 400 for negative quantity", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(invalidSweetRequests.negativeQuantity);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Quantity must be greater than 0");
  });

  test("PUT /sweets/:id - should return 400 for empty name", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(invalidSweetRequests.emptyName);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Name cannot be empty");
  });

  test("PUT /sweets/:id - should trim whitespace from name", async () => {
    const originalSweet = await createTestSweet();

    const response = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(updateSweetRequests.trimmedNameUpdate);

    expect(response.status).toBe(200);
    const updatedSweet: Sweet = response.body.data;
    expect(updatedSweet.name).toBe("Trimmed Update"); // Whitespace should be trimmed
  });

  test("PUT /sweets/:id - should prevent duplicate names with other sweets", async () => {
    // Create two sweets
    const sweet1 = await createTestSweet();
    const sweet2 = await createTestSweet();

    // Try to update sweet2 with sweet1's name
    const response = await request(app).put(`/sweets/${sweet2.id}`).send({
      name: sweet1.name,
      category: "Milk-Based",
      price: 40,
      quantity: 20,
    });

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("A sweet with this name already exists");
  });

  test("PUT /sweets/:id - should allow updating sweet with same name (case-insensitive)", async () => {
    const originalSweet = await createTestSweet();

    // Update with same name but different case
    const response = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send({
        name: originalSweet.name.toUpperCase(),
        category: "Chocolate-Based",
        price: 50,
        quantity: 25,
      });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    const updatedSweet: Sweet = response.body.data;
    expect(updatedSweet.name).toBe(originalSweet.name.toUpperCase());
  });

  test("PUT /sweets/:id - should update only price", async () => {
    const originalSweet = await createTestSweet();

    const updateData = {
      name: originalSweet.name,
      category: originalSweet.category,
      price: 99.99,
      quantity: originalSweet.quantity,
    };

    const response = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(updateData);

    expect(response.status).toBe(200);
    const updatedSweet: Sweet = response.body.data;
    expect(updatedSweet.price).toBe(99.99);
    expect(updatedSweet.name).toBe(originalSweet.name);
    expect(updatedSweet.category).toBe(originalSweet.category);
    expect(updatedSweet.quantity).toBe(originalSweet.quantity);
  });

  test("PUT /sweets/:id - should update only quantity", async () => {
    const originalSweet = await createTestSweet();

    const updateData = {
      name: originalSweet.name,
      category: originalSweet.category,
      price: originalSweet.price,
      quantity: 100,
    };

    const response = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(updateData);

    expect(response.status).toBe(200);
    const updatedSweet: Sweet = response.body.data;
    expect(updatedSweet.quantity).toBe(100);
    expect(updatedSweet.name).toBe(originalSweet.name);
    expect(updatedSweet.category).toBe(originalSweet.category);
    expect(updatedSweet.price).toBe(originalSweet.price);
  });

  test("PUT /sweets/:id - should handle zero ID", async () => {
    // Use dynamic name to avoid conflicts
    const updateData = {
      name: "Zero ID Update " + Date.now(),
      category: "Chocolate-Based",
      price: 55,
      quantity: 30,
    };

    const response = await request(app).put("/sweets/0").send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
  });

  test("PUT /sweets/:id - should handle negative ID", async () => {
    // Use dynamic name to avoid conflicts
    const updateData = {
      name: "Negative ID Update " + Date.now(),
      category: "Chocolate-Based",
      price: 55,
      quantity: 30,
    };

    const response = await request(app).put("/sweets/-1").send(updateData);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
  });

  test("PUT /sweets/:id - should handle decimal ID (convert to integer)", async () => {
    const originalSweet = await createTestSweet();

    // Use dynamic name to avoid conflicts
    const updateData = {
      name: "Decimal ID Update " + Date.now(),
      category: "Chocolate-Based",
      price: 55,
      quantity: 30,
    };

    const response = await request(app)
      .put(`/sweets/${originalSweet.id}.5`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Sweet updated successfully");
  });

  test("PUT /sweets/:id - should verify update persists in database", async () => {
    const originalSweet = await createTestSweet();

    // Use dynamic name to avoid conflicts
    const updateData = {
      name: "Database Persist Update " + Date.now(),
      category: "Chocolate-Based",
      price: 55,
      quantity: 30,
    };

    // Update the sweet
    const updateResponse = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(updateData);

    expect(updateResponse.status).toBe(200);

    // Fetch all sweets to verify the update persisted
    const allSweetsResponse = await request(app).get("/sweets");
    const allSweets = allSweetsResponse.body.data;

    const updatedSweetInDb = allSweets.find(
      (sweet: Sweet) => sweet.id === originalSweet.id
    );
    expect(updatedSweetInDb).toBeDefined();
    expect(updatedSweetInDb.name).toBe(updateData.name);
    expect(updatedSweetInDb.category).toBe(updateData.category);
    expect(updatedSweetInDb.price).toBe(updateData.price);
    expect(updatedSweetInDb.quantity).toBe(updateData.quantity);
  });

  test("PUT /sweets/:id - should update sweet with decimal quantity", async () => {
    // First create a sweet to update
    const originalSweet = await createTestSweet();

    const updateData = {
      name: "Decimal Updated Sweet " + Date.now(),
      category: "Chocolate-Based",
      price: 45.75,
      quantity: 7.25,
    };

    // Update the sweet with decimal quantity
    const updateResponse = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(updateData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);
    expect(updateResponse.body.message).toBe("Sweet updated successfully");

    const updatedSweet: Sweet = updateResponse.body.data;
    expect(updatedSweet.quantity).toBe(7.25);
    expect(updatedSweet.price).toBe(45.75);
    expect(updatedSweet.name).toBe(updateData.name);
  });

  test("PUT /sweets/:id - should update sweet with small decimal quantity", async () => {
    // First create a sweet to update
    const originalSweet = await createTestSweet();

    const updateData = {
      name: "Small Decimal Updated Sweet " + Date.now(),
      category: "Fruit-Based",
      price: 12.99,
      quantity: 0.5,
    };

    // Update the sweet with small decimal quantity
    const updateResponse = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(updateData);

    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.success).toBe(true);

    const updatedSweet: Sweet = updateResponse.body.data;
    expect(updatedSweet.quantity).toBe(0.5);
    expect(updatedSweet.price).toBe(12.99);
  });

  test("PUT /sweets/:id - should return 400 when updating to zero quantity", async () => {
    // First create a sweet to update
    const originalSweet = await createTestSweet();

    const updateData = {
      name: "Zero Quantity Update " + Date.now(),
      category: "Nut-Based",
      price: 35.0,
      quantity: 0.0,
    };

    // Try to update the sweet with zero quantity (should fail)
    const updateResponse = await request(app)
      .put(`/sweets/${originalSweet.id}`)
      .send(updateData);

    expect(updateResponse.status).toBe(400);
    expect(updateResponse.body.success).toBe(false);
    expect(updateResponse.body.message).toContain(
      "Quantity must be greater than 0"
    );
  });
});

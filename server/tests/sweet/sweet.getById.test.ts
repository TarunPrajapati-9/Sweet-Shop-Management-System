import { test, expect, describe } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import { Sweet } from "../../src/types/sweet.type";

describe("Get Sweet By ID", () => {
  // Helper function to create a sweet for testing
  const createTestSweet = async () => {
    const response = await request(app)
      .post("/sweets")
      .send({
        name: "Test Sweet for GetById " + Date.now(), // Ensure uniqueness
        category: "Milk-Based",
        price: 30,
        quantity: 15,
      });

    expect(response.status).toBe(201);
    return response.body.data;
  };

  test("GET /sweets/:id - should get an existing sweet successfully", async () => {
    // First create a sweet
    const createdSweet = await createTestSweet();

    // Now get the sweet by ID
    const getResponse = await request(app).get(`/sweets/${createdSweet.id}`);

    expect(getResponse.status).toBe(200);
    expect(getResponse.body).toHaveProperty("success");
    expect(getResponse.body).toHaveProperty("message");
    expect(getResponse.body).toHaveProperty("data");
    expect(getResponse.body.success).toBe(true);
    expect(getResponse.body.message).toBe("Sweet fetched successfully");

    const fetchedSweet: Sweet = getResponse.body.data;
    expect(fetchedSweet.id).toBe(createdSweet.id);
    expect(fetchedSweet.name).toBe(createdSweet.name);
    expect(fetchedSweet.category).toBe(createdSweet.category);
    expect(fetchedSweet.price).toBe(createdSweet.price);
    expect(fetchedSweet.quantity).toBe(createdSweet.quantity);
  });

  test("GET /sweets/:id - should return 404 for non-existent sweet", async () => {
    const nonExistentId = 99999;

    const response = await request(app).get(`/sweets/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
    expect(response.body.data).toEqual({});
  });

  test("GET /sweets/:id - should return 400 for invalid ID format", async () => {
    const invalidId = "not-a-number";

    const response = await request(app).get(`/sweets/${invalidId}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid sweet ID");
    expect(response.body.data).toEqual({});
  });

  test("GET /sweets/:id - should return 400 for zero ID", async () => {
    const response = await request(app).get("/sweets/0");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid sweet ID");
    expect(response.body.data).toEqual({});
  });

  test("GET /sweets/:id - should return 400 for negative ID", async () => {
    const response = await request(app).get("/sweets/-1");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid sweet ID");
    expect(response.body.data).toEqual({});
  });

  test("GET /sweets/:id - should handle decimal ID (convert to integer)", async () => {
    // First create a sweet
    const createdSweet = await createTestSweet();

    // Try to get the sweet with decimal ID
    const response = await request(app).get(`/sweets/${createdSweet.id}.5`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Sweet fetched successfully");

    const fetchedSweet: Sweet = response.body.data;
    expect(fetchedSweet.id).toBe(createdSweet.id);
  });
});

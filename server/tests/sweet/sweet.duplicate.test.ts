import { test, expect, describe } from "bun:test";
import request from "supertest";
import { duplicateNameRequests } from "./fixtures/sweet.fixtures";
import app from "../../src/app";

describe("Sweet Duplicate Validation", () => {
  test("POST /sweets - should prevent duplicate sweet names (case-insensitive)", async () => {
    // First, add the original sweet
    const firstResponse = await request(app)
      .post("/sweets")
      .send(duplicateNameRequests.original);

    expect(firstResponse.status).toBe(201);

    // Try to add a sweet with the same name but different case
    const duplicateResponse = await request(app)
      .post("/sweets")
      .send(duplicateNameRequests.duplicateLowerCase);

    expect(duplicateResponse.status).toBe(409);
    expect(duplicateResponse.body.success).toBe(false);
    expect(duplicateResponse.body.message).toBe(
      "A sweet with this name already exists"
    );
  });

  test("POST /sweets - should prevent duplicate sweet names (uppercase)", async () => {
    // Try to add a sweet with uppercase version of existing name
    const response = await request(app)
      .post("/sweets")
      .send(duplicateNameRequests.duplicateUpperCase);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("A sweet with this name already exists");
  });

  test("POST /sweets - should prevent duplicate sweet names (with spaces)", async () => {
    // Try to add a sweet with spaces around the name
    const response = await request(app)
      .post("/sweets")
      .send(duplicateNameRequests.duplicateWithSpaces);

    expect(response.status).toBe(409);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("A sweet with this name already exists");
  });

  test("POST /sweets - should allow different sweet names", async () => {
    const uniqueSweet = {
      name: "Unique Sweet Name " + Date.now(), // Ensure uniqueness
      category: "Milk-Based",
      price: 50,
      quantity: 20,
    };

    const response = await request(app).post("/sweets").send(uniqueSweet);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Sweet added successfully");
  });
});

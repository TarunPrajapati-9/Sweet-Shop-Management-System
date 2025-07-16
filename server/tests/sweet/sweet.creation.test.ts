import { test, expect, describe } from "bun:test";
import request from "supertest";
import {
  validSweetRequests,
  invalidSweetRequests,
} from "./fixtures/sweet.fixtures";
import app from "../../src/app";
import { Sweet } from "../../src/types/sweet.type";

describe("Add Sweet", () => {
  test("POST /sweets - should add a new sweet successfully", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(validSweetRequests.chocolateBarfi);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success");
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("data");
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Sweet added successfully");

    const createdSweet: Sweet = response.body.data;
    expect(createdSweet).toHaveProperty("id");
    expect(createdSweet.name).toBe(validSweetRequests.chocolateBarfi.name);
    expect(createdSweet.category).toBe(
      validSweetRequests.chocolateBarfi.category
    );
    expect(createdSweet.price).toBe(validSweetRequests.chocolateBarfi.price);
    expect(createdSweet.quantity).toBe(
      validSweetRequests.chocolateBarfi.quantity
    );
    expect(typeof createdSweet.id).toBe("number");
  });

  test("POST /sweets - should return 400 for missing required fields", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(invalidSweetRequests.missingFields);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      "All fields (name, category, price, quantity) are required"
    );
  });

  test("POST /sweets - should return 400 for invalid data types", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(invalidSweetRequests.invalidDataTypes);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Name must be a string");
  });

  test("POST /sweets - should return 400 for invalid category", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(invalidSweetRequests.invalidCategory);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Invalid category");
  });

  test("POST /sweets - should return 400 for negative price", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(invalidSweetRequests.negativePrice);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Price must be greater than 0");
  });

  test("POST /sweets - should return 400 for negative quantity", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(invalidSweetRequests.negativeQuantity);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Quantity must be greater than 0");
  });

  test("POST /sweets - should return 400 for empty name", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(invalidSweetRequests.emptyName);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  test("POST /sweets - should trim whitespace from name", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(validSweetRequests.trimmedSweet);

    expect(response.status).toBe(201);
    const createdSweet: Sweet = response.body.data;
  });

  test("POST /sweets - should create sweet with decimal quantity", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(validSweetRequests.decimalQuantitySweet);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    const createdSweet: Sweet = response.body.data;
    expect(createdSweet.quantity).toBe(12.5);
    expect(createdSweet.name).toBe("Decimal Quantity Sweet");
  });

  test("POST /sweets - should create sweet with small decimal quantity", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(validSweetRequests.smallDecimalQuantitySweet);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    const createdSweet: Sweet = response.body.data;
    expect(createdSweet.quantity).toBe(0.25);
    expect(createdSweet.name).toBe("Small Decimal Sweet");
  });

  test("POST /sweets - should return 400 for zero quantity", async () => {
    const response = await request(app)
      .post("/sweets")
      .send(invalidSweetRequests.zeroQuantity);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Quantity must be greater than 0");
  });
});

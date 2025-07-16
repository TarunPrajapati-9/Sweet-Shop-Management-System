import { test, expect, describe } from "bun:test";
import request from "supertest";
import app from "../src/app";
import { Sweet, validCategories } from "../src/types/sweet.type";
import { ApiResponse } from "../src/utils/response";

describe("Sweet Listing", () => {
  test("GET /sweets - should return all sweets", async () => {
    const response = await request(app).get("/sweets");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success");
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("data");
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("All sweets fetched successfully");
  });

  test("GET /sweets - should return array of Sweet objects", async () => {
    const response = await request(app).get("/sweets");
    const apiResponse: ApiResponse = response.body;
    const sweets: Sweet[] = apiResponse.data as Sweet[];

    expect(Array.isArray(sweets)).toBe(true);

    // Test each sweet has required properties
    sweets.forEach((sweet) => {
      expect(sweet).toHaveProperty("id");
      expect(sweet).toHaveProperty("name");
      expect(sweet).toHaveProperty("category");
      expect(sweet).toHaveProperty("price");
      expect(sweet).toHaveProperty("quantity");

      // Test property types
      expect(typeof sweet.id).toBe("number");
      expect(typeof sweet.name).toBe("string");
      expect(typeof sweet.category).toBe("string");
      expect(typeof sweet.price).toBe("number");
      expect(typeof sweet.quantity).toBe("number");
    });
  });

  test("GET /sweets - should have valid sweet categories", async () => {
    const response = await request(app).get("/sweets");
    const apiResponse: ApiResponse = response.body;
    const sweets: Sweet[] = apiResponse.data as Sweet[];

    sweets.forEach((sweet) => {
      expect(validCategories).toContain(sweet.category);
    });
  });

  test("GET /sweets - should have positive prices and quantities", async () => {
    const response = await request(app).get("/sweets");
    const apiResponse: ApiResponse = response.body;
    const sweets: Sweet[] = apiResponse.data as Sweet[];

    sweets.forEach((sweet) => {
      expect(sweet.price).toBeGreaterThan(0);
      expect(sweet.quantity).toBeGreaterThanOrEqual(0);
    });
  });

  test("GET /sweets - should have unique IDs", async () => {
    const response = await request(app).get("/sweets");
    const apiResponse: ApiResponse = response.body;
    const sweets: Sweet[] = apiResponse.data as Sweet[];

    const ids = sweets.map((sweet) => sweet.id);
    const uniqueIds = [...new Set(ids)];

    expect(ids).toHaveLength(uniqueIds.length);
  });

  test("GET /sweets - should return sweets sorted by ID", async () => {
    const response = await request(app).get("/sweets");
    const apiResponse: ApiResponse = response.body;
    const sweets: Sweet[] = apiResponse.data as Sweet[];

    const sortedIds = sweets.map((sweet) => sweet.id).sort((a, b) => a - b);
    const actualIds = sweets.map((sweet) => sweet.id);

    expect(actualIds).toEqual(sortedIds);
  });

  test("GET /sweets - should have non-empty sweet names", async () => {
    const response = await request(app).get("/sweets");
    const apiResponse: ApiResponse = response.body;
    const sweets: Sweet[] = apiResponse.data as Sweet[];

    sweets.forEach((sweet) => {
      expect(sweet.name.length).toBeGreaterThan(0);
    });
  });
});

describe("Add Sweet", () => {
  test("POST /sweets - should add a new sweet successfully", async () => {
    const newSweetRequest = {
      name: "Chocolate Barfi",
      category: "Chocolate-Based",
      price: 45,
      quantity: 25,
    };

    const response = await request(app).post("/sweets").send(newSweetRequest);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success");
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("data");
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Sweet added successfully");

    const createdSweet: Sweet = response.body.data;
    expect(createdSweet).toHaveProperty("id");
    expect(createdSweet.name).toBe(newSweetRequest.name);
    expect(createdSweet.category).toBe(newSweetRequest.category);
    expect(createdSweet.price).toBe(newSweetRequest.price);
    expect(createdSweet.quantity).toBe(newSweetRequest.quantity);
    expect(typeof createdSweet.id).toBe("number");
  });

  test("POST /sweets - should return 400 for missing required fields", async () => {
    const incompleteSweetRequest = {
      name: "Incomplete Sweet",
      // Missing category, price, quantity
    };

    const response = await request(app)
      .post("/sweets")
      .send(incompleteSweetRequest);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      "All fields (name, category, price, quantity) are required"
    );
  });

  test("POST /sweets - should return 400 for invalid data types", async () => {
    const invalidSweetRequest = {
      name: 123, // Should be string
      category: "Milk-Based",
      price: "not-a-number", // Should be number
      quantity: 10,
    };

    const response = await request(app)
      .post("/sweets")
      .send(invalidSweetRequest);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Name must be a string");
  });

  test("POST /sweets - should return 400 for invalid category", async () => {
    const invalidCategorySweetRequest = {
      name: "Invalid Category Sweet",
      category: "Non-Existent-Category",
      price: 25,
      quantity: 10,
    };

    const response = await request(app)
      .post("/sweets")
      .send(invalidCategorySweetRequest);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Invalid category");
  });

  test("POST /sweets - should return 400 for negative price", async () => {
    const negativePriceSweetRequest = {
      name: "Negative Price Sweet",
      category: "Milk-Based",
      price: -10,
      quantity: 5,
    };

    const response = await request(app)
      .post("/sweets")
      .send(negativePriceSweetRequest);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Price must be greater than 0");
  });

  test("POST /sweets - should return 400 for negative quantity", async () => {
    const negativeQuantitySweetRequest = {
      name: "Negative Quantity Sweet",
      category: "Milk-Based",
      price: 20,
      quantity: -5,
    };

    const response = await request(app)
      .post("/sweets")
      .send(negativeQuantitySweetRequest);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain(
      "quantity must be greater than or equal to 0"
    );
  });

  test("POST /sweets - should return 400 for empty name", async () => {
    const emptynameSweetRequest = {
      name: "   ", // Empty/whitespace name
      category: "Milk-Based",
      price: 15,
      quantity: 10,
    };

    const response = await request(app)
      .post("/sweets")
      .send(emptynameSweetRequest);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toContain("Name cannot be empty");
  });

  test("POST /sweets - should trim whitespace from name", async () => {
    const whitespaceSweetRequest = {
      name: "  Trimmed Sweet  ",
      category: "Milk-Based",
      price: 35,
      quantity: 20,
    };

    const response = await request(app)
      .post("/sweets")
      .send(whitespaceSweetRequest);

    expect(response.status).toBe(201);
    const createdSweet: Sweet = response.body.data;
    expect(createdSweet.name).toBe("Trimmed Sweet"); // Whitespace should be trimmed
  });
});

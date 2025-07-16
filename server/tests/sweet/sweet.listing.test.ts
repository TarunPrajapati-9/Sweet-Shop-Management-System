import { test, expect, describe } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import { ApiResponse } from "../../src/utils/response";
import { Sweet, validCategories } from "../../src/types/sweet.type";

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

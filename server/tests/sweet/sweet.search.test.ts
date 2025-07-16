import { test, expect, describe } from "bun:test";
import request from "supertest";
import app from "../../src/app";
import { Sweet } from "../../src/types/sweet.type";

describe("Search Sweets", () => {
  // Helper function to create test sweets with varied data for search testing
  const createTestSweetsForSearch = async () => {
    const testSweets = [
      {
        name: "Rasgulla",
        category: "Milk-Based",
        price: 25.0,
        quantity: 20,
      },
      {
        name: "Kaju Barfi",
        category: "Nut-Based",
        price: 45.0,
        quantity: 15,
      },
      {
        name: "Chocolate Barfi",
        category: "Chocolate-Based",
        price: 35.0,
        quantity: 30,
      },
      {
        name: "Gulab Jamun",
        category: "Milk-Based",
        price: 30.0,
        quantity: 25,
      },
      {
        name: "Dry Fruit Barfi",
        category: "Dry-Fruit-Based",
        price: 60.0,
        quantity: 10,
      },
      {
        name: "Mango Kulfi",
        category: "Fruit-Based",
        price: 20.0,
        quantity: 18,
      },
    ];

    const createdSweets = [];
    for (const sweet of testSweets) {
      const response = await request(app)
        .post("/sweets")
        .send({
          ...sweet,
          name: sweet.name + " " + Date.now(), // Make names unique
        });
      if (response.status === 201) {
        createdSweets.push(response.body.data);
      }
    }

    return createdSweets;
  };

  test("GET /sweets - should return all sweets when no query parameters provided", async () => {
    const response = await request(app).get("/sweets");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("success");
    expect(response.body).toHaveProperty("message");
    expect(response.body).toHaveProperty("data");
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("All sweets fetched successfully");
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  test("GET /sweets?name=rasgulla - should filter sweets by name (case insensitive)", async () => {
    // Create test data
    await createTestSweetsForSearch();

    const response = await request(app).get("/sweets?name=rasgulla");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('name containing "rasgulla"');

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should have "rasgulla" in their name (case insensitive)
    sweets.forEach((sweet) => {
      expect(sweet.name.toLowerCase()).toContain("rasgulla");
    });
  });

  test("GET /sweets?name=BARFI - should filter sweets by name (case insensitive partial match)", async () => {
    // Create test data
    await createTestSweetsForSearch();

    const response = await request(app).get("/sweets?name=BARFI");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('name containing "BARFI"');

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should have "barfi" in their name (case insensitive)
    sweets.forEach((sweet) => {
      expect(sweet.name.toLowerCase()).toContain("barfi");
    });

    // Should find multiple barfi varieties
    expect(sweets.length).toBeGreaterThan(0);
  });

  test("GET /sweets?category=Milk-Based - should filter sweets by category", async () => {
    // Create test data
    await createTestSweetsForSearch();

    const response = await request(app).get("/sweets?category=Milk-Based");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('category "Milk-Based"');

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should be Milk-Based
    sweets.forEach((sweet) => {
      expect(sweet.category.toLowerCase()).toBe("milk-based");
    });
  });

  test("GET /sweets?minPrice=30 - should filter sweets by minimum price", async () => {
    // Create test data
    await createTestSweetsForSearch();

    const response = await request(app).get("/sweets?minPrice=30");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("minimum price 30");

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should have price >= 30
    sweets.forEach((sweet) => {
      expect(sweet.price).toBeGreaterThanOrEqual(30);
    });
  });

  test("GET /sweets?maxPrice=40 - should filter sweets by maximum price", async () => {
    // Create test data
    await createTestSweetsForSearch();

    const response = await request(app).get("/sweets?maxPrice=40");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("maximum price 40");

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should have price <= 40
    sweets.forEach((sweet) => {
      expect(sweet.price).toBeLessThanOrEqual(40);
    });
  });

  test("GET /sweets?minPrice=20&maxPrice=50 - should filter sweets by price range", async () => {
    // Create test data
    await createTestSweetsForSearch();

    const response = await request(app).get("/sweets?minPrice=20&maxPrice=50");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain("minimum price 20");
    expect(response.body.message).toContain("maximum price 50");

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should have price between 20 and 50
    sweets.forEach((sweet) => {
      expect(sweet.price).toBeGreaterThanOrEqual(20);
      expect(sweet.price).toBeLessThanOrEqual(50);
    });
  });

  test("GET /sweets?name=barfi&category=Dry-Fruit-Based&minPrice=50&maxPrice=70 - should filter by multiple criteria", async () => {
    // Create test data
    await createTestSweetsForSearch();

    const response = await request(app).get(
      "/sweets?name=barfi&category=Dry-Fruit-Based&minPrice=50&maxPrice=70"
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('name containing "barfi"');
    expect(response.body.message).toContain('category "Dry-Fruit-Based"');
    expect(response.body.message).toContain("minimum price 50");
    expect(response.body.message).toContain("maximum price 70");

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should match all criteria
    sweets.forEach((sweet) => {
      expect(sweet.name.toLowerCase()).toContain("barfi");
      expect(sweet.category.toLowerCase()).toBe("dry-fruit-based");
      expect(sweet.price).toBeGreaterThanOrEqual(50);
      expect(sweet.price).toBeLessThanOrEqual(70);
    });
  });

  test("GET /sweets?name=nonexistent - should return empty array for no matches", async () => {
    const response = await request(app).get("/sweets?name=nonexistent");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('name containing "nonexistent"');
    expect(response.body.data).toEqual([]);
  });

  test("GET /sweets?minPrice=invalid - should return 400 for invalid minPrice", async () => {
    const response = await request(app).get("/sweets?minPrice=invalid");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid minPrice. Must be a positive number"
    );
    expect(response.body.data).toEqual({});
  });

  test("GET /sweets?maxPrice=invalid - should return 400 for invalid maxPrice", async () => {
    const response = await request(app).get("/sweets?maxPrice=invalid");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid maxPrice. Must be a positive number"
    );
    expect(response.body.data).toEqual({});
  });

  test("GET /sweets?minPrice=-10 - should return 400 for negative minPrice", async () => {
    const response = await request(app).get("/sweets?minPrice=-10");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "Invalid minPrice. Must be a positive number"
    );
    expect(response.body.data).toEqual({});
  });

  test("GET /sweets?minPrice=50&maxPrice=30 - should return 400 when minPrice > maxPrice", async () => {
    const response = await request(app).get("/sweets?minPrice=50&maxPrice=30");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe(
      "minPrice cannot be greater than maxPrice"
    );
    expect(response.body.data).toEqual({});
  });

  test("GET /sweets?minPrice=25.5&maxPrice=45.75 - should handle decimal prices", async () => {
    // Create test data
    await createTestSweetsForSearch();

    const response = await request(app).get(
      "/sweets?minPrice=25.5&maxPrice=45.75"
    );

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should have price between 25.5 and 45.75
    sweets.forEach((sweet) => {
      expect(sweet.price).toBeGreaterThanOrEqual(25.5);
      expect(sweet.price).toBeLessThanOrEqual(45.75);
    });
  });

  test("GET /sweets?category=MILK-BASED - should filter by category (case insensitive)", async () => {
    // Create test data
    await createTestSweetsForSearch();

    const response = await request(app).get("/sweets?category=MILK-BASED");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('category "MILK-BASED"');

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should be milk-based
    sweets.forEach((sweet) => {
      expect(sweet.category.toLowerCase()).toBe("milk-based");
    });
  });

  test("GET /sweets?name=k&minPrice=20 - should handle partial name match with price filter", async () => {
    // Create test data
    await createTestSweetsForSearch();

    const response = await request(app).get("/sweets?name=k&minPrice=20");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toContain('name containing "k"');
    expect(response.body.message).toContain("minimum price 20");

    const sweets: Sweet[] = response.body.data;
    expect(Array.isArray(sweets)).toBe(true);

    // All returned sweets should contain "k" in name and have price >= 20
    sweets.forEach((sweet) => {
      expect(sweet.name.toLowerCase()).toContain("k");
      expect(sweet.price).toBeGreaterThanOrEqual(20);
    });
  });
});

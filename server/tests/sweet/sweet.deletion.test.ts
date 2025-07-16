import { test, expect, describe } from "bun:test";
import request from "supertest";
import app from "../../src/app";

describe("Delete Sweet", () => {
  let createdSweetId: number;

  // Helper function to create a sweet for testing deletion
  const createTestSweet = async () => {
    const response = await request(app)
      .post("/sweets")
      .send({
        name: "Test Sweet for Deletion " + Date.now(), // Ensure uniqueness
        category: "Milk-Based",
        price: 30,
        quantity: 15,
      });

    expect(response.status).toBe(201);
    return response.body.data.id;
  };

  test("DELETE /sweets/:id - should delete an existing sweet successfully", async () => {
    // First create a sweet to delete
    const sweetId = await createTestSweet();

    // Now delete the sweet
    const deleteResponse = await request(app).delete(`/sweets/${sweetId}`);

    expect(deleteResponse.status).toBe(200);
    expect(deleteResponse.body).toHaveProperty("success");
    expect(deleteResponse.body).toHaveProperty("message");
    expect(deleteResponse.body).toHaveProperty("data");
    expect(deleteResponse.body.success).toBe(true);
    expect(deleteResponse.body.message).toBe("Sweet deleted successfully");
    expect(deleteResponse.body.data).toEqual({});

    // Verify the sweet is actually deleted by trying to delete again
    const secondDeleteResponse = await request(app).delete(
      `/sweets/${sweetId}`
    );
    expect(secondDeleteResponse.status).toBe(404);
  });

  test("DELETE /sweets/:id - should return 404 for non-existent sweet", async () => {
    const nonExistentId = 99999;

    const response = await request(app).delete(`/sweets/${nonExistentId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
    expect(response.body.data).toEqual({});
  });

  test("DELETE /sweets/:id - should return 404 for invalid ID format", async () => {
    const invalidId = "not-a-number";

    const response = await request(app).delete(`/sweets/${invalidId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
  });

  test("DELETE /sweets/:id - should handle negative ID", async () => {
    const negativeId = -1;

    const response = await request(app).delete(`/sweets/${negativeId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
  });

  test("DELETE /sweets/:id - should handle zero ID", async () => {
    const zeroId = 0;

    const response = await request(app).delete(`/sweets/${zeroId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
  });

  test("DELETE /sweets/:id - should verify sweet is removed from database", async () => {
    // Create a sweet
    const sweetId = await createTestSweet();

    // Verify it exists by getting all sweets
    const beforeDeleteResponse = await request(app).get("/sweets");
    const beforeSweets = beforeDeleteResponse.body.data;
    const existsBefore = beforeSweets.some(
      (sweet: any) => sweet.id === sweetId
    );
    expect(existsBefore).toBe(true);

    // Delete the sweet
    const deleteResponse = await request(app).delete(`/sweets/${sweetId}`);
    expect(deleteResponse.status).toBe(200);

    // Verify it no longer exists by getting all sweets
    const afterDeleteResponse = await request(app).get("/sweets");
    const afterSweets = afterDeleteResponse.body.data;
    const existsAfter = afterSweets.some((sweet: any) => sweet.id === sweetId);
    expect(existsAfter).toBe(false);
  });

  test("DELETE /sweets/:id - should handle decimal ID (should convert to integer)", async () => {
    // Create a sweet
    const sweetId = await createTestSweet();

    // Try to delete with decimal ID
    const response = await request(app).delete(`/sweets/${sweetId}.5`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe("Sweet deleted successfully");
  });

  test("DELETE /sweets/:id - should handle very large ID", async () => {
    const veryLargeId = 999999999;

    const response = await request(app).delete(`/sweets/${veryLargeId}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Sweet not found");
  });

  test("DELETE /sweets/:id - multiple deletions should maintain data integrity", async () => {
    // Create multiple sweets
    const sweetId1 = await createTestSweet();
    const sweetId2 = await createTestSweet();
    const sweetId3 = await createTestSweet();

    // Delete them one by one
    const delete1 = await request(app).delete(`/sweets/${sweetId1}`);
    expect(delete1.status).toBe(200);

    const delete2 = await request(app).delete(`/sweets/${sweetId2}`);
    expect(delete2.status).toBe(200);

    const delete3 = await request(app).delete(`/sweets/${sweetId3}`);
    expect(delete3.status).toBe(200);

    // Verify all are deleted
    const allSweetsResponse = await request(app).get("/sweets");
    const remainingSweets = allSweetsResponse.body.data;

    const deletedIds = [sweetId1, sweetId2, sweetId3];
    deletedIds.forEach((id) => {
      const exists = remainingSweets.some((sweet: any) => sweet.id === id);
      expect(exists).toBe(false);
    });
  });
});

import { Sweet } from "../types/sweet.type";
import { validCategories } from "../types/sweet.type";

export const isValidSweet = (sweet: Partial<Sweet>): string | null => {
  const { name, category, price, quantity } = sweet;

  // Check if all required fields are present
  if (!name || !category || price === undefined || quantity === undefined) {
    return "All fields (name, category, price, quantity) are required";
  }

  // Check data types
  if (typeof name !== "string") {
    return "Name must be a string";
  }

  if (typeof category !== "string") {
    return "Category must be a string";
  }

  if (typeof price !== "number") {
    return "Price must be a number";
  }

  if (typeof quantity !== "number") {
    return "Quantity must be a number";
  }

  // Check if name is not empty after trimming whitespace
  if (name.trim().length === 0) {
    return "Name cannot be empty";
  }

  // Check price validation
  if (price <= 0) {
    return "Price must be greater than 0";
  }

  // Check quantity validation
  if (quantity < 0) {
    return "quantity must be greater than or equal to 0";
  }

  // Check if category is valid
  if (!validCategories.includes(category)) {
    return `Invalid category. Valid categories are: ${validCategories.join(
      ", "
    )}`;
  }

  return null; // All validation passed
};

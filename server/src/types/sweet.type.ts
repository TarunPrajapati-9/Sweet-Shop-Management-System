export interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export const validCategories = [
  "Milk-Based", // e.g., Rasgulla, Gulab Jamun
  "Nut-Based", // e.g., Kaju Katli, Badam Barfi
  "Vegetable-Based", // e.g., Gajar Halwa, Lauki Halwa
  "Flour-Based", // e.g., Ladoo, Jalebi
  "Fried", // e.g., Imarti, Balushahi
  "Dry-Fruit-Based", // e.g., Dry Fruit Roll
  "Chocolate-Based", // e.g., Choco Barfi
  "Fruit-Based", // e.g., Pineapple Halwa
  "Coconut-Based", // e.g., Nariyal Ladoo
  "Fusion", // e.g., Cheesecake Barfi
];

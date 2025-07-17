export interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export const validCategories = [
  "MilkBased", // e.g., Rasgulla, Gulab Jamun
  "NutBased", // e.g., Kaju Katli, Badam Barfi
  "VegetableBased", // e.g., Gajar Halwa, Lauki Halwa
  "FlourBased", // e.g., Ladoo, Jalebi
  "Fried", // e.g., Imarti, Balushahi
  "DryFruitBased", // e.g., Dry Fruit Roll
  "ChocolateBased", // e.g., Choco Barfi
  "FruitBased", // e.g., Pineapple Halwa
  "CoconutBased", // e.g., Nariyal Ladoo
  "Fusion", // e.g., Cheesecake Barfi
];

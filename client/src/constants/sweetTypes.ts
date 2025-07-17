export interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export const categories = [
  "MilkBased",
  "NutBased",
  "VegetableBased",
  "FlourBased",
  "Fried",
  "DryFruitBased",
  "ChocolateBased",
  "FruitBased",
  "CoconutBased",
  "Fusion",
];

export const categoryDisplayNames: Record<string, string> = {
  MilkBased: "Milk Based",
  NutBased: "Nut Based",
  VegetableBased: "Vegetable Based",
  FlourBased: "Flour Based",
  Fried: "Fried",
  DryFruitBased: "Dry Fruit Based",
  ChocolateBased: "Chocolate Based",
  FruitBased: "Fruit Based",
  CoconutBased: "Coconut Based",
  Fusion: "Fusion",
};

export const getStockStatus = (quantity: number) => {
  if (quantity === 0)
    return { label: "Out of Stock", variant: "destructive" as const };
  if (quantity < 10)
    return { label: "Low Stock", variant: "secondary" as const };
  return { label: "In Stock", variant: "default" as const };
};

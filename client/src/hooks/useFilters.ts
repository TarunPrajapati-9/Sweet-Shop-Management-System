import { useState } from "react";

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  quantity: number;
}

export const useFilters = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredSweets = (sweets: Sweet[]) => {
    return sweets.filter(
      (sweet) =>
        sweet.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        (selectedCategory === "all" || sweet.category === selectedCategory)
    );
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredSweets,
  };
};

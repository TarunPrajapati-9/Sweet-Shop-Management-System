import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sweet,
  categories,
  categoryDisplayNames,
} from "@/constants/sweetTypes";

interface SweetFormProps {
  onSubmit: (data: Omit<Sweet, "id">) => void;
  initialData?: Sweet;
  isPending?: boolean;
}

export function SweetForm({
  onSubmit,
  initialData,
  isPending,
}: SweetFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    price: initialData?.price?.toString() || "",
    quantity: initialData?.quantity?.toString() || "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.name ||
      !formData.category ||
      !formData.price ||
      !formData.quantity
    ) {
      return;
    }
    onSubmit({
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
    });
    if (!initialData) {
      setFormData({
        name: "",
        category: "",
        price: "",
        quantity: "",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Sweet Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setFormData({ ...formData, name: e.target.value })
          }
          placeholder="Enter sweet name"
          required
        />
      </div>

      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value: string) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {categoryDisplayNames[category]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price (₹)</Label>
          <Input
            id="price"
            type="number"
            value={formData.price}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, price: e.target.value })
            }
            placeholder="Enter price"
            min="0"
            step="0.01"
            required
          />
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            value={formData.quantity}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            placeholder="Enter quantity"
            min="0"
            required
          />
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-orange-600 hover:bg-orange-700"
        disabled={
          isPending ||
          !formData.name ||
          !formData.category ||
          !formData.price ||
          !formData.quantity
        }
      >
        {isPending
          ? initialData
            ? "Updating..."
            : "Adding..."
          : initialData
          ? "Update Sweet"
          : "Add Sweet"}
      </Button>
    </form>
  );
}

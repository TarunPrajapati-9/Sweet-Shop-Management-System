"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { Plus, Search, Package, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getSweets } from "@/lib/dataGetter";
import { addSweet } from "@/lib/dataPoster";
import { editSweet, restockSweet } from "@/lib/dataPutter";
import { deleteSweet } from "@/lib/dataDeleter";

// Types
interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

// Categories
const categories = [
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

const categoryDisplayNames: Record<string, string> = {
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

export default function SweetShopManagement() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);
  const { toast } = useToast();
  const queryclient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["sweets"],
    queryFn: getSweets,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: addSweet,
    onSuccess: (res) => {
      if (res.success) {
        setIsAddDialogOpen(false);
        toast({
          title: "Sweet Added",
          description: "Sweet has been added successfully.",
        });
        queryclient.invalidateQueries({ queryKey: ["sweets"] });
      } else {
        toast({
          title: "Sweet Not Added",
          description: "Sweet has been not added. " + res.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add sweet. Please try again." + error,
        variant: "destructive",
      });
    },
  });

  const { mutate: editMutate, isPending: editPending } = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Omit<Sweet, "id"> }) =>
      editSweet(id, data),
    onSuccess: (res) => {
      if (res.success) {
        setIsEditDialogOpen(false);
        setEditingSweet(null);
        toast({
          title: "Sweet Updated",
          description: "Sweet has been updated successfully.",
        });
        queryclient.invalidateQueries({ queryKey: ["sweets"] });
      } else {
        toast({
          title: "Sweet Not Updated",
          description: "Sweet has been not updated. " + res.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update sweet. Please try again." + error,
        variant: "destructive",
      });
    },
  });

  const { mutate: deleteMutate, isPending: deletePending } = useMutation({
    mutationFn: (id: number) => deleteSweet(id),
    onSuccess: (res) => {
      if (res.success) {
        toast({
          title: "Sweet Deleted",
          description: "Sweet has been deleted successfully.",
          variant: "destructive",
        });
        queryclient.invalidateQueries({ queryKey: ["sweets"] });
      } else {
        toast({
          title: "Sweet Not Deleted",
          description: "Sweet has been not deleted. " + res.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete sweet. Please try again." + error,
        variant: "destructive",
      });
    },
  });

  const { mutate: restockMutate, isPending: restockPending } = useMutation({
    mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
      restockSweet(id, quantity),
    onSuccess: (res) => {
      if (res.success) {
        toast({
          title: "Stock Updated",
          description: "Stock has been updated successfully.",
        });
        queryclient.invalidateQueries({ queryKey: ["sweets"] });
      } else {
        toast({
          title: "Stock Not Updated",
          description: "Stock has been not updated. " + res.message,
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update stock. Please try again." + error,
        variant: "destructive",
      });
    },
  });

  // Initialize with data from database
  useEffect(() => {
    if (data?.data) {
      setSweets(data.data);
      setFilteredSweets(data.data);
    }
  }, [data]);

  // Filter sweets based on search, category, and stock
  useEffect(() => {
    let filtered = sweets;

    if (searchTerm) {
      filtered = filtered.filter((sweet) =>
        sweet.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (sweet) => sweet.category === selectedCategory
      );
    }

    if (stockFilter === "inStock") {
      filtered = filtered.filter((sweet) => sweet.quantity > 0);
    } else if (stockFilter === "outOfStock") {
      filtered = filtered.filter((sweet) => sweet.quantity === 0);
    }

    setFilteredSweets(filtered);
  }, [sweets, searchTerm, selectedCategory, stockFilter]);

  const handleAddSweet = (sweetData: Omit<Sweet, "id">) => {
    console.log(sweetData);
    mutate(sweetData);
  };

  const handleEditSweet = (sweetData: Omit<Sweet, "id">) => {
    if (!editingSweet) return;

    editMutate({
      id: editingSweet.id,
      data: sweetData,
    });
  };

  const handleDeleteSweet = (id: number) => {
    deleteMutate(id);
  };

  const handleRestock = (id: number, newQuantity: number) => {
    restockMutate({
      id: id,
      quantity: newQuantity,
    });
  };

  const getStockStatus = (quantity: number) => {
    if (quantity === 0)
      return { label: "Out of Stock", variant: "destructive" as const };
    if (quantity < 10)
      return { label: "Low Stock", variant: "secondary" as const };
    return { label: "In Stock", variant: "default" as const };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-orange-900 mb-2">
                🍬 Sweet Shop Management
              </h1>
              <p className="text-orange-700">
                Manage your sweet inventory with ease
              </p>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Sweet
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Sweet</DialogTitle>
                </DialogHeader>
                <SweetForm onSubmit={handleAddSweet} isPending={isPending} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total Sweets
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="text-2xl font-bold text-orange-900">
                {sweets.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                In Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="text-2xl font-bold text-green-600">
                {sweets.filter((s) => s.quantity > 0).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                Out of Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="text-2xl font-bold text-red-600">
                {sweets.filter((s) => s.quantity === 0).length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="text-sm font-medium text-gray-600">
                Low Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 pb-4">
              <div className="text-2xl font-bold text-yellow-600">
                {sweets.filter((s) => s.quantity > 0 && s.quantity < 10).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-4 bg-white/80 backdrop-blur-sm">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search sweets by name..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchTerm(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {categoryDisplayNames[category]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={stockFilter} onValueChange={setStockFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by stock" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Items</SelectItem>
                  <SelectItem value="inStock">In Stock</SelectItem>
                  <SelectItem value="outOfStock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Sweets Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className="bg-white/80 backdrop-blur-sm animate-pulse"
              >
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-red-600 mb-2">
                Error Loading Data
              </h3>
              <p className="text-gray-500">
                Unable to fetch sweets from the database. Please try again
                later.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSweets.map((sweet) => {
              const stockStatus = getStockStatus(sweet.quantity);
              return (
                <Card
                  key={sweet.id}
                  className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg text-orange-900">
                          {sweet.name}
                        </CardTitle>
                        <p className="text-sm text-orange-600 mt-1">
                          {categoryDisplayNames[sweet.category]}
                        </p>
                      </div>
                      <Badge variant={stockStatus.variant}>
                        {stockStatus.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center mb-4">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{sweet.price}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Package className="w-4 h-4 mr-1" />
                        {sweet.quantity} KG
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingSweet(sweet);
                          setIsEditDialogOpen(true);
                        }}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newQuantity = prompt(
                            `Current stock: ${sweet.quantity}. Enter new quantity:`
                          );
                          if (newQuantity && !isNaN(Number(newQuantity))) {
                            handleRestock(sweet.id, Number(newQuantity));
                          }
                        }}
                        className="flex-1"
                        disabled={restockPending}
                      >
                        <Package className="w-4 h-4 mr-1" />
                        Restock
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (
                            confirm(
                              `Are you sure you want to delete ${sweet.name}?`
                            )
                          ) {
                            handleDeleteSweet(sweet.id);
                          }
                        }}
                        disabled={deletePending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {filteredSweets.length === 0 && !isLoading && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardContent className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No sweets found
              </h3>
              <p className="text-gray-500">
                Try adjusting your search or filters
              </p>
            </CardContent>
          </Card>
        )}

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Sweet</DialogTitle>
            </DialogHeader>
            {editingSweet && (
              <SweetForm
                onSubmit={handleEditSweet}
                initialData={editingSweet}
                isPending={editPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </div>
  );
}

// Sweet Form Component
function SweetForm({
  onSubmit,
  initialData,
  isPending,
}: {
  onSubmit: (data: Omit<Sweet, "id">) => void;
  initialData?: Sweet;
  isPending?: boolean;
}) {
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

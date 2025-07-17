import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getSweets } from "@/lib/dataGetter";
import { addSweet } from "@/lib/dataPoster";
import { editSweet, restockSweet } from "@/lib/dataPutter";
import { deleteSweet } from "@/lib/dataDeleter";

interface Sweet {
  id: number;
  name: string;
  category: string;
  price: number;
  quantity: number;
}

export function useSweetManagement() {
  const [sweets, setSweets] = useState<Sweet[]>([]);
  const [filteredSweets, setFilteredSweets] = useState<Sweet[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [stockFilter, setStockFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSweet, setEditingSweet] = useState<Sweet | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for fetching sweets
  const { data, isLoading, error } = useQuery({
    queryKey: ["sweets"],
    queryFn: getSweets,
  });

  // Add sweet mutation
  const { mutate: addSweetMutation, isPending: isAddPending } = useMutation({
    mutationFn: addSweet,
    onSuccess: (res) => {
      if (res.success) {
        setIsAddDialogOpen(false);
        toast({
          title: "Sweet Added",
          description: "Sweet has been added successfully.",
        });
        queryClient.invalidateQueries({ queryKey: ["sweets"] });
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

  // Edit sweet mutation
  const { mutate: editSweetMutation, isPending: isEditPending } = useMutation({
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
        queryClient.invalidateQueries({ queryKey: ["sweets"] });
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

  // Delete sweet mutation
  const { mutate: deleteSweetMutation, isPending: isDeletePending } =
    useMutation({
      mutationFn: (id: number) => deleteSweet(id),
      onSuccess: (res) => {
        if (res.success) {
          toast({
            title: "Sweet Deleted",
            description: "Sweet has been deleted successfully.",
            variant: "destructive",
          });
          queryClient.invalidateQueries({ queryKey: ["sweets"] });
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

  // Restock sweet mutation
  const { mutate: restockSweetMutation, isPending: isRestockPending } =
    useMutation({
      mutationFn: ({ id, quantity }: { id: number; quantity: number }) =>
        restockSweet(id, quantity),
      onSuccess: (res) => {
        if (res.success) {
          toast({
            title: "Stock Updated",
            description: "Stock has been updated successfully.",
          });
          queryClient.invalidateQueries({ queryKey: ["sweets"] });
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

  // Handler functions
  const handleAddSweet = (sweetData: Omit<Sweet, "id">) => {
    addSweetMutation(sweetData);
  };

  const handleEditSweet = (sweetData: Omit<Sweet, "id">) => {
    if (!editingSweet) return;
    editSweetMutation({
      id: editingSweet.id,
      data: sweetData,
    });
  };

  const handleDeleteSweet = (id: number) => {
    deleteSweetMutation(id);
  };

  const handleRestock = (id: number, newQuantity: number) => {
    restockSweetMutation({
      id: id,
      quantity: newQuantity,
    });
  };

  const openEditDialog = (sweet: Sweet) => {
    setEditingSweet(sweet);
    setIsEditDialogOpen(true);
  };

  return {
    // State
    sweets,
    filteredSweets,
    searchTerm,
    selectedCategory,
    stockFilter,
    isAddDialogOpen,
    isEditDialogOpen,
    editingSweet,

    // API state
    isLoading,
    error,
    isAddPending,
    isEditPending,
    isDeletePending,
    isRestockPending,

    // Actions
    setSearchTerm,
    setSelectedCategory,
    setStockFilter,
    setIsAddDialogOpen,
    setIsEditDialogOpen,
    setEditingSweet,
    handleAddSweet,
    handleEditSweet,
    handleDeleteSweet,
    handleRestock,
    openEditDialog,
  };
}

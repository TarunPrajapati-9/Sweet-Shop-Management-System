"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Toaster } from "@/components/ui/toaster";
import { useOwnerAuth } from "@/hooks/useOwnerAuth";
import { useSweetManagement } from "@/hooks/useSweetManagement";
import { PasswordLogin } from "@/components/PasswordLogin";
import { OwnerHeader } from "@/components/OwnerHeader";
import { StatsCards } from "@/components/StatsCards";
import { SearchFilters } from "@/components/SearchFilters";
import { SweetsGrid } from "@/components/SweetsGrid";
import { SweetForm } from "@/components/SweetForm";

export default function SweetShopManagement() {
  const {
    isAuthenticated,
    isLoading: authLoading,
    authenticate,
  } = useOwnerAuth();

  const {
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
    handleAddSweet,
    handleEditSweet,
    handleDeleteSweet,
    handleRestock,
    openEditDialog,
  } = useSweetManagement();

  // Handle authentication states
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-spin">
            <span className="text-white font-bold text-xl">🍭</span>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <PasswordLogin onAuthenticate={authenticate} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      <div className="container mx-auto p-4">
        {/* Header */}
        <OwnerHeader
          isAddDialogOpen={isAddDialogOpen}
          setIsAddDialogOpen={setIsAddDialogOpen}
          onAddSweet={handleAddSweet}
          isAddPending={isAddPending}
        />

        {/* Stats Cards */}
        <StatsCards sweets={sweets} />

        {/* Filters */}
        <SearchFilters
          searchTerm={searchTerm}
          selectedCategory={selectedCategory}
          stockFilter={stockFilter}
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onStockFilterChange={setStockFilter}
        />

        {/* Sweets Grid */}
        <SweetsGrid
          filteredSweets={filteredSweets}
          isLoading={isLoading}
          error={error}
          onEdit={openEditDialog}
          onDelete={handleDeleteSweet}
          onRestock={handleRestock}
          isDeletePending={isDeletePending}
          isRestockPending={isRestockPending}
        />

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
                isPending={isEditPending}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
      <Toaster />
    </div>
  );
}

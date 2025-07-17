"use client";

import { useSweetKiosk } from "@/hooks/useSweetKiosk";
import { useFilters } from "@/hooks/useFilters";
import { categoryDisplayNames } from "@/constants/categories";
import { OrderSuccess } from "@/components/OrderSuccess";
import { KioskHeader } from "@/components/KioskHeader";
import { Filters } from "@/components/Filters";
import { Cart } from "@/components/Cart";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Toaster } from "@/components/ui/toaster";

export default function SweetKiosk() {
  const {
    sweets,
    cart,
    userToken,
    orderPlaced,
    currentOrderId,
    isLoading,
    error,
    orderPending,
    addToCart,
    updateQuantity,
    getTotalPrice,
    getTotalItems,
    placeOrder,
    startNewOrder,
  } = useSweetKiosk();

  const {
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    filteredSweets,
  } = useFilters();

  const filtered = filteredSweets(sweets);

  if (orderPlaced) {
    return (
      <OrderSuccess
        currentOrderId={currentOrderId}
        userToken={userToken}
        onStartNewOrder={startNewOrder}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <KioskHeader>
        <Cart
          cart={cart}
          totalItems={getTotalItems()}
          totalPrice={getTotalPrice()}
          onUpdateQuantity={updateQuantity}
          onPlaceOrder={placeOrder}
          orderPending={orderPending}
        />
      </KioskHeader>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <Filters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Sweet Menu */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-white animate-pulse">
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
          <Card className="bg-white">
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
            {filtered.map((sweet) => (
              <Card
                key={sweet.id}
                className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-pink-300 bg-white"
              >
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-xl mb-2 text-gray-800">
                        {sweet.name}
                      </h3>
                      <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
                        {categoryDisplayNames[sweet.category] || sweet.category}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-pink-600">
                        ₹{sweet.price}
                      </div>
                      <div className="text-sm text-gray-500">
                        {sweet.quantity} KG available
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {sweet.description}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button
                    onClick={() => addToCart(sweet)}
                    disabled={sweet.quantity === 0 || orderPending}
                    size="lg"
                    className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-lg py-6"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Add to Order
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}

        {filtered.length === 0 && !isLoading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl">
              No sweets found matching your search.
            </p>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

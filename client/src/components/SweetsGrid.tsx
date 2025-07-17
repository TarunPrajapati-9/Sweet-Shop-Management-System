import { Card, CardContent } from "@/components/ui/card";
import { SweetCard } from "@/components/SweetCard";
import { Sweet } from "@/constants/sweetTypes";

interface SweetsGridProps {
  filteredSweets: Sweet[];
  isLoading: boolean;
  error: Error | null;
  onEdit: (sweet: Sweet) => void;
  onDelete: (id: number) => void;
  onRestock: (id: number, newQuantity: number) => void;
  isDeletePending: boolean;
  isRestockPending: boolean;
}

export function SweetsGrid({
  filteredSweets,
  isLoading,
  error,
  onEdit,
  onDelete,
  onRestock,
  isDeletePending,
  isRestockPending,
}: SweetsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="bg-white/80 backdrop-blur-sm animate-pulse">
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
    );
  }

  if (error) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-600 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-500">
            Unable to fetch sweets from the database. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (filteredSweets.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardContent className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No sweets found
          </h3>
          <p className="text-gray-500">Try adjusting your search or filters</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredSweets.map((sweet) => (
        <SweetCard
          key={sweet.id}
          sweet={sweet}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestock={onRestock}
          isDeletePending={isDeletePending}
          isRestockPending={isRestockPending}
        />
      ))}
    </div>
  );
}

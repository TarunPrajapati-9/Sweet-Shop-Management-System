import { Package, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Sweet,
  categoryDisplayNames,
  getStockStatus,
} from "@/constants/sweetTypes";

interface SweetCardProps {
  sweet: Sweet;
  onEdit: (sweet: Sweet) => void;
  onDelete: (id: number) => void;
  onRestock: (id: number, newQuantity: number) => void;
  isDeletePending: boolean;
  isRestockPending: boolean;
}

export function SweetCard({
  sweet,
  onEdit,
  onDelete,
  onRestock,
  isDeletePending,
  isRestockPending,
}: SweetCardProps) {
  const stockStatus = getStockStatus(sweet.quantity);

  const handleRestock = () => {
    const newQuantity = prompt(
      `Current stock: ${sweet.quantity}. Enter new quantity:`
    );
    if (newQuantity && !isNaN(Number(newQuantity))) {
      onRestock(sweet.id, Number(newQuantity));
    }
  };

  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete ${sweet.name}?`)) {
      onDelete(sweet.id);
    }
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-shadow">
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
          <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="text-2xl font-bold text-green-600">
            ₹{sweet.price}
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Package className="w-4 h-4 mr-1" />
            {sweet.quantity} KG or Litre
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(sweet)}
            className="flex-1"
          >
            <Edit className="w-4 h-4 mr-1" />
            Edit
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleRestock}
            className="flex-1"
            disabled={isRestockPending}
          >
            <Package className="w-4 h-4 mr-1" />
            Restock
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeletePending}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sweet } from "@/constants/sweetTypes";

interface StatsCardsProps {
  sweets: Sweet[];
}

export function StatsCards({ sweets }: StatsCardsProps) {
  const stats = {
    total: sweets.length,
    inStock: sweets.filter((s) => s.quantity > 0).length,
    outOfStock: sweets.filter((s) => s.quantity === 0).length,
    lowStock: sweets.filter((s) => s.quantity > 0 && s.quantity < 10).length,
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader className="pb-2 pt-4">
          <CardTitle className="text-sm font-medium text-gray-600">
            Total Sweets
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 pb-4">
          <div className="text-2xl font-bold text-orange-900">
            {stats.total}
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
            {stats.inStock}
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
            {stats.outOfStock}
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
            {stats.lowStock}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

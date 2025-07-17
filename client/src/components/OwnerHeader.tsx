import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { SweetForm } from "@/components/SweetForm";
import { Sweet } from "@/constants/sweetTypes";
import Link from "next/link";

interface OwnerHeaderProps {
  isAddDialogOpen: boolean;
  setIsAddDialogOpen: (open: boolean) => void;
  onAddSweet: (sweetData: Omit<Sweet, "id">) => void;
  isAddPending: boolean;
}

export function OwnerHeader({
  isAddDialogOpen,
  setIsAddDialogOpen,
  onAddSweet,
  isAddPending,
}: OwnerHeaderProps) {
  return (
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

        <div className="flex items-center space-x-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              Back to Shop
            </Button>
          </Link>

          <Link href="/orders">
            <Button variant="outline" size="sm">
              Orders
            </Button>
          </Link>

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
              <SweetForm onSubmit={onAddSweet} isPending={isAddPending} />
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-orange-900 mb-2">
            🍬 Sweet Shop Management
          </h1>
          <p className="text-orange-700 text-sm sm:text-base">
            Manage your sweet inventory with ease
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <Link href="/">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              <span className="hidden sm:inline">Back to Menu</span>
              <span className="sm:hidden">Menu</span>
            </Button>
          </Link>

          <Link href="/orders">
            <Button variant="outline" size="sm" className="text-xs sm:text-sm">
              Orders
            </Button>
          </Link>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-orange-600 hover:bg-orange-700 text-xs sm:text-sm px-2 sm:px-4">
                <Plus className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add New Sweet</span>
                <span className="sm:hidden">Add</span>
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

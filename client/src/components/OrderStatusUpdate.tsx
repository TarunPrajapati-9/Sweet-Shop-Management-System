import { useState } from "react";
import { Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

interface OrderStatusUpdateProps {
  orderId: string;
  currentStatus: string;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  isUpdating: boolean;
}

export function OrderStatusUpdate({
  orderId,
  currentStatus,
  onStatusUpdate,
  isUpdating,
}: OrderStatusUpdateProps) {
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUpdate = () => {
    if (selectedStatus !== currentStatus) {
      onStatusUpdate(orderId, selectedStatus);
      setIsDialogOpen(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />;
      case "pending":
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
      default:
        return <Clock className="w-3 h-3 sm:w-4 sm:h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "bg-green-500 hover:bg-green-600 text-white";
      case "pending":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      default:
        return "bg-gray-500 hover:bg-gray-600 text-white";
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={`${getStatusColor(
            currentStatus
          )} border-none text-xs sm:text-sm px-2 py-1 sm:px-3 sm:py-2 w-full sm:w-auto min-w-0 truncate`}
          disabled={isUpdating}
        >
          <span className="flex items-center min-w-0">
            {getStatusIcon(currentStatus)}
            <span className="ml-1 sm:ml-2 truncate">Update</span>
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm sm:max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">
            Update Order Status
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Order ID: {orderId}</label>
          </div>
          <div>
            <label className="text-sm font-medium">
              Current Status: {currentStatus}
            </label>
          </div>
          <div>
            <label className="text-sm font-medium">New Status:</label>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2 text-yellow-500" />
                    Pending
                  </div>
                </SelectItem>
                <SelectItem value="Completed">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                    Completed
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 pt-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpdate}
              disabled={selectedStatus === currentStatus || isUpdating}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isUpdating ? "Updating..." : "Update Status"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

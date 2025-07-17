import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface KioskHeaderProps {
  children: React.ReactNode;
}

export const KioskHeader: React.FC<KioskHeaderProps> = ({ children }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div>
              <h1 className="text-2xl font-bold text-orange-900">
                🍬 Loyal Sweets
              </h1>
              <p className="text-sm text-orange-700">
                Select your favorite sweets and place your order
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/orders">
              <Button
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                Orders
              </Button>
            </Link>

            <Link href="/owner">
              <Button
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
                onClick={() => {
                  sessionStorage.removeItem("ownerAuthenticated");
                }}
              >
                Owner Panel
              </Button>
            </Link>

            {children}
          </div>
        </div>
      </div>
    </header>
  );
};

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
        <div className="flex items-center justify-between flex-wrap gap-4 md:flex-nowrap">
          <div className="flex items-center space-x-2">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-orange-900">
                🍬 Loyal Sweets
              </h1>
              <p className="text-xs sm:text-sm text-orange-700 hidden sm:block">
                Select your favorite sweets and place your order
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <Link href="/owner">
              <Button
                variant="outline"
                size="sm"
                className="text-orange-600 border-orange-200 hover:bg-orange-50 text-xs sm:text-sm px-2 sm:px-3"
                onClick={() => {
                  sessionStorage.removeItem("ownerAuthenticated");
                }}
              >
                <span className="hidden sm:inline">Owner Panel</span>
                <span className="sm:hidden">Owner</span>
              </Button>
            </Link>

            {children}
          </div>
        </div>
      </div>
    </header>
  );
};

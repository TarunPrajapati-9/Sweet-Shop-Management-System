import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface KioskHeaderProps {
  children: React.ReactNode;
}

export const KioskHeader: React.FC<KioskHeaderProps> = ({ children }) => {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-pink-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xl">🍭</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                Loyal Sweets
              </h1>
              <p className="text-sm text-gray-600">
                Select your sweets and place your order
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/owner">
              <Button
                variant="outline"
                size="sm"
                className="text-purple-600 border-purple-200 hover:bg-purple-50"
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

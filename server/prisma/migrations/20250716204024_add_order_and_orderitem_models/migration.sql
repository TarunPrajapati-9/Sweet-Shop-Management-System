-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('Pending', 'Preparing', 'Ready', 'Completed');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "token" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'Pending',
    "total" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "orderId" TEXT NOT NULL,
    "sweetId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_token_key" ON "Order"("token");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_sweetId_fkey" FOREIGN KEY ("sweetId") REFERENCES "Sweet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

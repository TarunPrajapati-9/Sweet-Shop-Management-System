/**
 * Prisma Client Configuration
 *
 * This file sets up the Prisma client with proper singleton pattern
 * to prevent multiple instances in development environment.
 */

import { PrismaClient } from "@prisma/client";

/**
 * Global type augmentation for Prisma client
 * Ensures proper typing for the global object
 */
declare global {
  var prisma: PrismaClient | undefined;
}

/**
 * Prisma client singleton instance
 * Uses global object in development to prevent multiple instances
 * during hot reloading, but creates new instance in production
 */
export const prisma = globalThis.prisma || new PrismaClient();

/**
 * In development, store the client on the global object
 * to prevent creating multiple instances during hot reloading
 */
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}

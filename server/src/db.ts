// server/src/db.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

/**
 * Create exactly one PrismaClient per Node.js process.
 * - In dev: cache it on globalThis to survive hot-reloads.
 * - In prod: just create it once.
 * - Optional: enable query logging in development only.
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

// Cache on global in dev so we don’t create new clients on hot reloads
if (process.env.NODE_ENV === 'development') {
  globalForPrisma.prisma = prisma;
}

// (Optional) Graceful shutdown — not strictly required, but tidy.
process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect();
  } catch {}
});

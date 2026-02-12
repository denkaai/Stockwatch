import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  (() => {
    if (process.env.NODE_ENV === "production" && !process.env.DATABASE_URL) {
      // In production builds (vercel), we might not have the DB URL available during build time
      // Return a dummy object or just warn?
      // Better to let Prisma throw its own error if we actually TRY to connect.
      // But let's check if we are building.
      return new PrismaClient({ log: ["error"] });
    }
    return new PrismaClient({ log: ["error"] });
  })();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

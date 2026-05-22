import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function getCleanDatabaseUrl() {
  const url = new URL(process.env.DATABASE_URL!);
  url.searchParams.delete("sslmode");
  url.searchParams.delete("connection_limit");
  return url.toString();
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: getCleanDatabaseUrl(),
    ssl: { rejectUnauthorized: false },
    max: 1,
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

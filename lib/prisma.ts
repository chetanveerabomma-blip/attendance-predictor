import { PrismaClient } from "@prisma/client";
import path from "path";
import fs from "fs";

// Resolve database path reliably across all environments and platforms
const cwd = process.cwd();
const prismaDb = path.resolve(cwd, "prisma", "dev.db");
const rootDb = path.resolve(cwd, "dev.db");
const resolvedDbPath = fs.existsSync(prismaDb) ? prismaDb : rootDb;
const normalizedDbUrl = `file:${resolvedDbPath.replace(/\\/g, "/")}`;

// Always ensure DATABASE_URL is defined on process.env before Prisma engine initializes
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = normalizedDbUrl;
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || normalizedDbUrl,
      },
    },
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

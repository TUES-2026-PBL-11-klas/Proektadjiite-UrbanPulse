import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export const initializeDatabase = async () => {
  try {
    await prisma.$connect();
    console.log("Database connection established.");
  } catch (error) {
    console.error("Unable to connect to database:", error);
    throw error;
  }
};

export default prisma;

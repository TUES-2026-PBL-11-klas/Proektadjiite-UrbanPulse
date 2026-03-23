import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import util from "util";
import dotenv from "dotenv";

dotenv.config();

const execPromise = util.promisify(exec);

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export const initializeDatabase = async () => {
  try {
    console.log("Syncing database schema...");
    const { stdout, stderr } = await execPromise(
      "npx prisma db push --accept-data-loss",
    );

    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);

    await prisma.$connect();
    console.log("Database connection established and schema synced.");
  } catch (error) {
    console.error("Unable to initialize database:", error);
    throw error;
  }
};

export default prisma;

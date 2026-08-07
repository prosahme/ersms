import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Your own account — use this every day while developing
  const testAdmin = await prisma.user.upsert({
    where: { email: "admin@test.com" },
    update: {},
    create: {
      fullName: "Test Administrator",
      email: "admin@test.com",
      password: await bcrypt.hash("Admin@123", 10),
      role: "ADMINISTRATOR",
      isActive: true,
      firstLogin: true,
    },
  });

  console.log("Seed complete. Created/found user:", testAdmin.email);

  // Client's real account — not used until we deploy and hand it over
  const clientAdmin = await prisma.user.upsert({
    where: { email: "familyelec5@gmail.com" },
    update: {},
    create: {
      fullName: "Client Administrator",
      email: "familyelec5@gmail.com",
      password: await bcrypt.hash("Repair@2026!", 10),
      role: "ADMINISTRATOR",
      isActive: true,
      firstLogin: true,
    },
  });

  console.log("Seed complete. Created/found user:", clientAdmin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
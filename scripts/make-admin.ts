import "dotenv/config";
import { prisma } from "../lib/prisma";

const email = process.argv[2];

if (!email) {
  console.error("Укажи email: npm run admin:make -- test@test.com");
  process.exit(1);
}

async function main() {
  const user = await prisma.user.update({
    where: {
      email,
    },
    data: {
      role: "ADMIN",
    },
    select: {
      id: true,
      email: true,
      role: true,
    },
  });

  console.log("User updated:", user);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
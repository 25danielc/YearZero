import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { seedDemoData } from "../src/lib/seed"

const prisma = new PrismaClient()

async function main() {
  console.log("Starting seed...")

  // Create demo user
  const email = "demo@example.com"
  const passwordHash = await bcrypt.hash("demo123", 10)

  let user = await prisma.user.findUnique({
    where: { email },
  })

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
      },
    })
  }

  // Delete existing data
  await prisma.checkIn.deleteMany({ where: { userId: user.id } })
  await prisma.badge.deleteMany({ where: { userId: user.id } })
  await prisma.graceToken.deleteMany({ where: { userId: user.id } })
  await prisma.resolution.deleteMany({ where: { userId: user.id } })
  await prisma.levelProgress.deleteMany({ where: { userId: user.id } })

  // Seed demo data
  await seedDemoData(user.id)

  console.log("Seed completed!")
  console.log(`Demo user: ${email} / demo123`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })


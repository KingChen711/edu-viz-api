import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
  .finally(() => console.log('Done'))

function getRandomPastDate(): Date {
  const today = new Date()
  const pastDays = Math.floor(Math.random() * 30)
  today.setDate(today.getDate() - pastDays)
  return today
}

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'admin@cs2smokes.com'
  const username = 'AdminTest'
  const password = 'admin123'
  const hashedPassword = await bcrypt.hash(password, 10)

  // Проверяем, существует ли уже admin
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username: 'Admin' }] },
  })

  if (existing) {
    // Обновляем существующего
    const admin = await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: 'admin',
        password: hashedPassword,
        email,
        username,
      },
    })
    console.log('✅ Admin аккаунт обновлён:')
    console.log(`   Email:    ${admin.email}`)
    console.log(`   Username: ${admin.username}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role:     ${admin.role}`)
  } else {
    // Создаём нового
    const admin = await prisma.user.create({
      data: {
        email,
        username,
        password: hashedPassword,
        role: 'admin',
      },
    })
    console.log('✅ Admin аккаунт создан:')
    console.log(`   Email:    ${admin.email}`)
    console.log(`   Username: ${admin.username}`)
    console.log(`   Password: ${password}`)
    console.log(`   Role:     ${admin.role}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateAdminRole() {
  // Найти пользователя с username 'Admin'
  const adminUser = await prisma.user.findFirst({
    where: {
      username: 'Admin',
    },
  })

  if (adminUser) {
    await prisma.user.update({
      where: { id: adminUser.id },
      data: { role: 'admin' },
    })
    console.log(`✅ Updated user "${adminUser.username}" (${adminUser.email}) to role: admin`)
  } else {
    console.log('❌ No admin user found, trying by email...')
    // Пробуем по email
    const adminByEmail = await prisma.user.findFirst({
      where: {
        email: { contains: 'admin' },
      },
    })
    if (adminByEmail) {
      await prisma.user.update({
        where: { id: adminByEmail.id },
        data: { role: 'admin' },
      })
      console.log(`✅ Updated user "${adminByEmail.username}" (${adminByEmail.email}) to role: admin`)
    }
  }

  await prisma.$disconnect()
}

updateAdminRole().catch(console.error)

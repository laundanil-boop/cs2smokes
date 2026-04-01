import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateRoles() {
  // Обновляем root на admin
  const updated = await prisma.user.updateMany({
    where: { role: 'root' },
    data: { role: 'admin' },
  })
  
  console.log(`✅ Обновлено ${updated.count} пользователей с root на admin`)
  
  // Создаём модератора если нет
  const moderator = await prisma.user.findFirst({
    where: { role: 'moderator' },
  })
  
  if (!moderator) {
    await prisma.user.create({
      data: {
        email: 'moder@cs2smokes.com',
        username: 'Moderator',
        password: '$2a$10$BQlZJsFvXZQ9kLqQJ9qQJ.LqQJ9qQJ.LqQJ9qQJ.LqQJ9qQJ.LqQJ', // placeholder
        role: 'moderator',
      },
    })
    console.log('✅ Создан пользователь moderator@cs2smokes.com')
  }
  
  await prisma.$disconnect()
}

updateRoles().catch(console.error)

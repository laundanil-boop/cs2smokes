import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const contactSchema = z.object({
  name: z.string().min(1, 'Имя обязательно'),
  email: z.string().email('Некорректный email'),
  subject: z.string().min(1, 'Тема обязательна'),
  message: z.string().min(1, 'Сообщение обязательно'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = contactSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.errors[0].message },
        { status: 400 }
      )
    }

    const { name, email, subject, message } = validation.data

    // Создаем сообщение в базе данных
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'PENDING',
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Сообщение отправлено',
      data: {
        id: contactMessage.id,
      },
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}

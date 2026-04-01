import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Необходима авторизация' },
        { status: 401 }
      )
    }

    // Проверка на админа или модератора
    const isAdmin = user.role === 'admin' || user.role === 'moderator'
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Только админы могут загружать изображения' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Файл не найден' },
        { status: 400 }
      )
    }

    // Проверка типа файла
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'Недопустимый формат. Разрешены: JPEG, PNG, WebP, GIF' },
        { status: 400 }
      )
    }

    // Проверка размера (макс 5MB)
    const maxSize = 5 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Файл слишком большой. Максимум 5MB' },
        { status: 400 }
      )
    }

    // Создаём директорию для загрузок
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'positions')
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Генерируем уникальное имя файла
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop() || 'jpg'
    const filename = `position-${timestamp}-${random}.${extension}`
    const filepath = join(uploadDir, filename)

    // Читаем файл и записываем на диск
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)

    // Возвращаем URL
    const imageUrl = `/uploads/positions/${filename}`

    return NextResponse.json({
      success: true,
      data: { imageUrl, filename },
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при загрузке файла' },
      { status: 500 }
    )
  }
}

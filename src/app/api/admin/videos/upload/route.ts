import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const VIDEOS_DIR = path.join(process.cwd(), 'public', 'videos', 'lineups')

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'root')) {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещён' },
        { status: 403 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('video') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'Файл не найден' },
        { status: 400 }
      )
    }

    // Проверка типа файла
    const allowedTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-msvideo', 'video/x-matroska']
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp4|webm|mkv|avi|mov)$/i)) {
      return NextResponse.json(
        { success: false, error: 'Неподдерживаемый формат видео. Используйте MP4, WebM, MKV, AVI или MOV' },
        { status: 400 }
      )
    }

    // Проверка размера (макс 500MB)
    const maxSize = 500 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'Файл слишком большой. Максимум 500MB' },
        { status: 400 }
      )
    }

    // Создаём уникальное имя файла
    const ext = path.extname(file.name)
    const baseName = path.basename(file.name, ext)
      .replace(/[^a-zA-Z0-9а-яА-Я_-]/g, '_')
      .toLowerCase()
    const timestamp = Date.now()
    const fileName = `${baseName}_${timestamp}${ext}`
    const filePath = path.join(VIDEOS_DIR, fileName)

    // Сохраняем файл
    const bytes = await file.arrayBuffer()
    fs.writeFileSync(filePath, Buffer.from(bytes))

    return NextResponse.json({
      success: true,
      data: {
        fileName,
        url: `/videos/lineups/${fileName}`,
        size: file.size,
      },
    })
  } catch (error) {
    console.error('Upload video error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при загрузке видео' },
      { status: 500 }
    )
  }
}

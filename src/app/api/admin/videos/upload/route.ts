import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { put, del, list } from '@vercel/blob'

const BLOB_DIR = 'videos/lineups'

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
    const ext = file.name.split('.').pop()?.toLowerCase()
    const allowedExts = ['mp4', 'webm', 'mkv', 'avi', 'mov']
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext || '')) {
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

    // Уникальное имя файла
    const baseName = file.name.replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9а-яА-Я_-]/g, '_')
      .toLowerCase()
    const timestamp = Date.now()
    const fileName = `${BLOB_DIR}/${baseName}_${timestamp}.${ext}`

    // Загрузка в Vercel Blob
    const blob = await put(fileName, file, {
      access: 'public',
      addRandomSuffix: false,
    })

    return NextResponse.json({
      success: true,
      data: {
        fileName: blob.pathname.split('/').pop(),
        url: blob.url,
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

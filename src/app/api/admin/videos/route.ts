import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import fs from 'fs'
import path from 'path'

const VIDEOS_DIR = path.join(process.cwd(), 'public', 'videos', 'lineups')

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'root')) {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещён' },
        { status: 403 }
      )
    }

    if (!fs.existsSync(VIDEOS_DIR)) {
      return NextResponse.json({ success: true, data: [] })
    }

    const files = fs.readdirSync(VIDEOS_DIR)
      .filter(f => /\.(mp4|webm|mkv|avi|mov)$/i.test(f))
      .map(f => {
        const stats = fs.statSync(path.join(VIDEOS_DIR, f))
        return {
          name: f,
          url: `/videos/lineups/${f}`,
          size: stats.size,
          createdAt: stats.birthtime,
        }
      })
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    return NextResponse.json({ success: true, data: files })
  } catch (error) {
    console.error('List videos error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при получении списка видео' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'root')) {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещён' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const fileName = searchParams.get('file')

    if (!fileName) {
      return NextResponse.json(
        { success: false, error: 'Имя файла обязательно' },
        { status: 400 }
      )
    }

    // Защита от path traversal
    const safeName = path.basename(fileName)
    const filePath = path.join(VIDEOS_DIR, safeName)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: 'Файл не найден' },
        { status: 404 }
      )
    }

    fs.unlinkSync(filePath)

    return NextResponse.json({ success: true, message: 'Видео удалено' })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении видео' },
      { status: 500 }
    )
  }
}

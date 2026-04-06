import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { list, del } from '@vercel/blob'

const BLOB_DIR = 'videos/lineups'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user || (user.role !== 'admin' && user.role !== 'root')) {
      return NextResponse.json(
        { success: false, error: 'Доступ запрещён' },
        { status: 403 }
      )
    }

    const { blobs } = await list({ prefix: BLOB_DIR })

    const files = blobs.map(blob => ({
      name: blob.pathname.split('/').pop() || blob.pathname,
      url: blob.url,
      size: blob.size,
      createdAt: blob.uploadedAt,
    }))

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
    const url = searchParams.get('url')

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'URL файла обязателен' },
        { status: 400 }
      )
    }

    await del(url)

    return NextResponse.json({ success: true, message: 'Видео удалено' })
  } catch (error) {
    console.error('Delete video error:', error)
    return NextResponse.json(
      { success: false, error: 'Ошибка при удалении видео' },
      { status: 500 }
    )
  }
}

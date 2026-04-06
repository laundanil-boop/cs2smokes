import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Загрузка видео не поддерживается. Используйте YouTube.' },
    { status: 400 }
  )
}

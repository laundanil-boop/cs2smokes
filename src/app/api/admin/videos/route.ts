import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ success: true, data: [] })
}

export async function DELETE() {
  return NextResponse.json({ success: false, error: 'Не поддерживается' }, { status: 400 })
}

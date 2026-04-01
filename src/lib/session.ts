import { SessionOptions } from 'iron-session'

export const sessionOptions: SessionOptions = {
  password: process.env.IRON_SESSION_PASSWORD!,
  cookieName: 'cs2smokes-session',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
}

export interface SessionData {
  userId: string
  username: string
  email: string
  role?: string
  referredByUserId?: string | null
  isLoggedIn: boolean
}

import { getIronSession } from 'iron-session'
import { cookies } from 'next/headers'
import { sessionOptions, SessionData } from './session'

export async function getSession() {
  const cookieStore = await cookies()
  return getIronSession<SessionData>(cookieStore, sessionOptions)
}

export async function isAuthenticated() {
  const session = await getSession()
  return session.isLoggedIn ?? false
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session.isLoggedIn) return null
  return {
    id: session.userId,
    username: session.username,
    email: session.email,
    role: session.role,
    referredByUserId: session.referredByUserId,
  }
}

export async function isAdmin() {
  const session = await getSession()
  return session.role === 'admin' || session.role === 'root'
}

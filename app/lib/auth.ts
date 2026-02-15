import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import bcryptjs from 'bcryptjs'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'
const COOKIE_NAME = 'auth_token'

/**
 * AUTENTICACIÓN CON JWT
 */

export interface JWTPayload {
  userId: string
  email: string
  username: string
}

// ==================== JWT ====================

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: '30d', // Token válido por 30 días
    algorithm: 'HS256',
  })
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as any
    return {
      userId: decoded.userId,
      email: decoded.email,
      username: decoded.username,
    }
  } catch (error) {
    return null
  }
}

// ==================== COOKIES ====================

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,           // No accessible desde JS (protección XSS)
    secure: process.env.NODE_ENV === 'production', // Solo HTTPS en producción
    sameSite: 'lax',          // Protección CSRF
    maxAge: 30 * 24 * 60 * 60, // 30 días
    path: '/',
  })
}

export async function getAuthCookie(): Promise<string | undefined> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value
}

export async function removeAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

// ==================== SESSION ====================

export async function getSession(): Promise<JWTPayload | null> {
  const token = await getAuthCookie()
  if (!token) return null
  return verifyToken(token)
}

// ==================== PASSWORD ====================

export async function hashPassword(password: string): Promise<string> {
  const salt = await bcryptjs.genSalt(10)
  return bcryptjs.hash(password, salt)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcryptjs.compare(password, hash)
}

import { NextRequest, NextResponse } from 'next/server'
import { LoginSchema } from '@/app/lib/validate'
import { getUserByEmail, getUserPassword } from '@/app/lib/db'
import { verifyPassword, signToken, setAuthCookie } from '@/app/lib/auth'

/**
 * LOGIN DE USUARIO
 * POST /api/auth/login
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos
    const validation = LoginSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos' },
        { status: 400 }
      )
    }

    const { email, password } = validation.data

    // Buscar usuario
    const user = await getUserByEmail(email)
    if (!user) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Verificar contraseña
    const storedPasswordHash = await getUserPassword(user.id)
    if (!storedPasswordHash) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    const isPasswordValid = await verifyPassword(password, storedPasswordHash)
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Email o contraseña incorrectos' },
        { status: 401 }
      )
    }

    // Generar token
    const token = signToken({
      userId: user.id,
      email: user.email,
      username: user.username,
    })

    // Guardar en cookies
    await setAuthCookie(token)

    return NextResponse.json(
      {
        success: true,
        userId: user.id,
        username: user.username,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error en el login' },
      { status: 500 }
    )
  }
}

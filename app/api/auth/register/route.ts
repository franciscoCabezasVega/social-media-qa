import { NextRequest, NextResponse } from 'next/server'
import { RegisterSchema } from '@/app/lib/validate'
import { createUser, getUserByEmail, getUserByUsername, getNextId } from '@/app/lib/db'
import { hashPassword, signToken, setAuthCookie } from '@/app/lib/auth'
import { generateId } from '@/app/lib/utils'

/**
 * REGISTRO DE USUARIO
 * POST /api/auth/register
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validar datos con Zod
    const validation = RegisterSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Datos inválidos',
          details: validation.error.issues,
        },
        { status: 400 }
      )
    }

    const { email, username, password, fullName } = validation.data

    // Verificar si email ya existe
    const existingEmail = await getUserByEmail(email)
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Este email ya está registrado' },
        { status: 409 }
      )
    }

    // Verificar si username ya existe
    const existingUsername = await getUserByUsername(username)
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Este username ya está en uso' },
        { status: 409 }
      )
    }

    // Hash de contraseña
    const hashedPassword = await hashPassword(password)

    // Crear usuario
    const userId = generateId('user', await getNextId('user'))
    const now = Date.now()

    await createUser({
      id: userId,
      email,
      username,
      password: hashedPassword,
      fullName,
      bio: '',
      profileImage: undefined,
      createdAt: now,
      updatedAt: now,
      isPrivate: false,
    })

    // Generar token JWT
    const token = signToken({
      userId,
      email,
      username,
    })

    // Guardar en cookies
    await setAuthCookie(token)

    return NextResponse.json(
      {
        success: true,
        userId,
        username,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Error en el registro' },
      { status: 500 }
    )
  }
}

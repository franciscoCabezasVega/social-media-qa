import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { UpdateProfileSchema } from '@/app/lib/validate'
import { updateUser, getUserById } from '@/app/lib/db'

/**
 * OBTENER O ACTUALIZAR PERFIL DEL USUARIO ACTUAL
 * GET /api/users/profile - Obtener datos del usuario autenticado
 * PUT /api/users/profile - Actualizar datos del usuario autenticado
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await getUserById(session.userId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      fullName: user.fullName,
      bio: user.bio,
      isPrivate: user.isPrivate,
      profileImage: user.profileImage || null,
    })
  } catch (error) {
    console.error('Get profile error:', error)
    return NextResponse.json(
      { error: 'Failed to get profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validar
    const validation = UpdateProfileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data' },
        { status: 400 }
      )
    }

    const updates = validation.data

    // Actualizar usuario
    await updateUser(session.userId, updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Update profile error:', error)
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}

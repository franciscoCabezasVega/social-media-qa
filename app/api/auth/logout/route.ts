import { NextRequest, NextResponse } from 'next/server'
import { removeAuthCookie } from '@/app/lib/auth'

/**
 * LOGOUT DE USUARIO
 * DELETE /api/auth/logout
 */

export async function DELETE(_request: NextRequest) {
  try {
    await removeAuthCookie()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Error en el logout' },
      { status: 500 }
    )
  }
}

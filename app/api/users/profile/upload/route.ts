import { getSession } from '@/app/lib/auth'
import { updateUser } from '@/app/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

/**
 * POST /api/users/profile/upload
 * Manejar subida de imagen de perfil
 *
 * Acepta: FormData con archivo "profileImage"
 * En desarrollo: Convierte a base64
 * En producción: Usa Vercel Blob
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('profileImage') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validar tipo de archivo
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, WebP, and GIF images are allowed' },
        { status: 400 }
      )
    }

    // Validar tamaño
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    const buffer = await file.arrayBuffer()
    const base64 = Buffer.from(buffer).toString('base64')
    const dataUrl = `data:${file.type};base64,${base64}`

    // Actualizar usuario con la imagen
    await updateUser(session.userId, {
      profileImage: dataUrl,
    })

    return NextResponse.json({
      success: true,
      message: 'Image uploaded successfully',
      imageUrl: dataUrl,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Error uploading image' },
      { status: 500 }
    )
  }
}

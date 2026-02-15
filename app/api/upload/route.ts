import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/app/lib/blob'
import { getSession } from '@/app/lib/auth'

/**
 * UPLOAD DE IMÁGENES A VERCEL BLOB
 * POST /api/upload
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Determinar carpeta
    const folder = formData.get('folder') as 'profile-images' | 'posts'
    const uploadFolder = folder || 'posts'

    // Subir imagen
    const url = await uploadImage(file, uploadFolder)

    return NextResponse.json({ url })
  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Upload failed' },
      { status: 500 }
    )
  }
}

import { put, del } from '@vercel/blob'

/**
 * MANEJO DE ARCHIVOS CON VERCEL BLOB
 */

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

export async function uploadImage(
  file: File,
  folder: 'profile-images' | 'posts'
): Promise<string> {
  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('Archivo muy grande, máximo 5MB')
  }

  // Validar tipo
  if (!file.type.startsWith('image/')) {
    throw new Error('Solo se permiten imágenes')
  }

  // Generar nombre único
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 9)
  const extension = file.name.split('.').pop() || 'jpg'
  const filename = `${timestamp}-${random}.${extension}`

  const path = `${folder}/${filename}`

  // Subir a Blob
  const response = await put(path, file, {
    access: 'public',
    contentType: file.type,
  })

  return response.url
}

export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url)
  } catch (error) {
    console.error('Error deleting image:', error)
    // No lanzar error, solo log
  }
}

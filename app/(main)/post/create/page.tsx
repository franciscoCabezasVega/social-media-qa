'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * PÁGINA PARA CREAR POST
 */

export default function CreatePostPage() {
  const router = useRouter()
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState<string>('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten imágenes')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen no debe superar 5MB')
      return
    }

    setImage(file)
    setError('')

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!image) {
      setError('Debes seleccionar una imagen')
      return
    }

    setLoading(true)

    try {
      // 1. Subir imagen a Vercel Blob
      const formData = new FormData()
      formData.append('file', image)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const data = await uploadResponse.json()
        setError(data.error || 'Error al subir imagen')
        setLoading(false)
        return
      }

      const uploadData = await uploadResponse.json()

      // 2. Crear post
      const postResponse = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caption,
          image: uploadData.url,
        }),
      })

      if (!postResponse.ok) {
        const data = await postResponse.json()
        setError(data.error || 'Error al crear post')
        setLoading(false)
        return
      }

      router.push('/feed')
    } catch (err) {
      setError('Error en la conexión')
      console.error(err)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Crear post</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold mb-2">Imagen</label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
            {preview ? (
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-64 mx-auto rounded"
                />
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">Selecciona una imagen</p>
                <p className="text-xs text-gray-500">PNG, JPG, GIF (máx. 5MB)</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Caption</label>
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={2200}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded"
            placeholder="Escribe tu descripción..."
          />
          <p className="text-xs text-gray-500 mt-1">
            {caption.length}/2200 caracteres
          </p>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading || !image}
            className="flex-1 bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600 disabled:bg-gray-300"
          >
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 py-2 rounded font-semibold hover:bg-gray-300"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

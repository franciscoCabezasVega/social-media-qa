'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

/**
 * PÁGINA DE EDICIÓN DE PERFIL
 * - Editar nombre, bio, privacidad
 * - Subir imagen de perfil
 */

export default function EditProfilePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [formData, setFormData] = useState({
    fullName: '',
    bio: '',
    isPrivate: false,
  })
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    // Cargar datos del usuario actual
    const loadProfile = async () => {
      try {
        const response = await fetch('/api/users/profile', {
          credentials: 'include',
        })

        if (!response.ok) {
          console.error('Failed to load profile:', response.status)
          setError('Error al cargar el perfil')
          setLoading(false)
          return
        }

        const data = await response.json()
        setFormData({
          fullName: data.fullName || '',
          bio: data.bio || '',
          isPrivate: data.isPrivate || false,
        })
        if (data.profileImage) {
          setProfileImage(data.profileImage)
          setImagePreview(data.profileImage)
        }
        setLoading(false)
      } catch (err) {
        console.error('Error loading profile:', err)
        setError('Error al cargar el perfil')
        setLoading(false)
      }
    }

    loadProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as any
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    })
  }

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Mostrar preview inmediatamente
    const reader = new FileReader()
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Subir imagen al servidor
    await uploadImage(file)
  }

  const uploadImage = async (file: File) => {
    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('profileImage', file)

      const response = await fetch('/api/users/profile/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error al subir la imagen')
        setUploading(false)
        return
      }

      const data = await response.json()
      setProfileImage(data.imageUrl)
      setImagePreview(data.imageUrl)
      setSuccess('✅ Imagen actualizada')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Upload error:', err)
      setError('Error al subir la imagen')
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Error al actualizar perfil')
        return
      }

      setSuccess('✅ Perfil actualizado correctamente')
      // Esperar un poco y luego volver, permitiendo que Vercel revalide la caché
      setTimeout(() => router.back(), 1500)
    } catch (err) {
      setError('Error en la conexión')
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center text-gray-500">Cargando datos del perfil...</div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Editar perfil</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {/* Sección de imagen de perfil */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold">Foto de perfil</label>
          
          <div className="flex items-center gap-6">
            {/* Vista previa de imagen */}
            <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border-4 border-gray-300">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-gray-400 text-sm">Sin foto</span>
              )}
            </div>

            {/* Botón para cambiar imagen */}
            <div className="flex-1">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex-1 bg-blue-500 text-white px-4 py-2 rounded font-semibold hover:bg-blue-600 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {uploading ? 'Subiendo...' : 'Cambiar foto'}
              </button>
              <p className="text-xs text-gray-500 mt-2">
                PNG, JPG, GIF o WebP. Máximo 5MB.
              </p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Nombre completo</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-2">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            maxLength={150}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Cuéntanos sobre ti"
          />
          <p className="text-xs text-gray-500 mt-1">
            {formData.bio.length}/150 caracteres
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="isPrivate"
              checked={formData.isPrivate}
              onChange={handleChange}
              className="w-4 h-4 border border-gray-300 rounded"
            />
            <span className="text-sm font-semibold">
              Perfil privado 🔒
            </span>
          </label>
          <span className="text-xs text-gray-500">
            Solo tus seguidores pueden ver tu perfil
          </span>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            className="flex-1 bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600 transition disabled:bg-gray-300"
          >
            Guardar cambios
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 bg-gray-200 py-2 rounded font-semibold hover:bg-gray-300 transition"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}

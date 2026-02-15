'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fullName: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Asegurar que se envíen las cookies
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || `Error ${response.status}`)
        console.error('Signup error:', data)
        return
      }

      const data = await response.json()
      console.log('Signup successful:', data)

      // Pequeño delay para asegurar que la cookie se procese
      await new Promise(resolve => setTimeout(resolve, 100))

      // Usar window.location para una redirección más confiable
      window.location.href = '/feed'
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error en la conexión: ${errorMsg}`)
      console.error('Signup exception:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Social Media QA</h1>
        <p className="text-gray-600 text-sm">Crea tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            {error}
          </div>
        )}

        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:bg-white text-sm"
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="fullName"
            placeholder="Nombre completo"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:bg-white text-sm"
            required
          />
        </div>

        <div>
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:bg-white text-sm"
            required
          />
        </div>

        <div>
          <input
            type="password"
            name="password"
            placeholder="Contraseña (mín. 8 caracteres)"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:bg-white text-sm"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Debe contener mayúscula y número
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600 disabled:bg-gray-300 text-sm"
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>
      </form>

      <div className="mt-6 text-center border-t border-gray-200 pt-6">
        <span className="text-gray-600 text-sm">¿Ya tienes cuenta? </span>
        <Link href="/login" className="text-blue-500 font-semibold hover:text-blue-700 text-sm">
          Inicia sesión
        </Link>
      </div>
    </div>
  )
}

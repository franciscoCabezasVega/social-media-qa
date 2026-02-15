'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setDebugInfo('')
    setLoading(true)

    try {
      setDebugInfo('Enviando credenciales...')

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Asegurar que se envíen las cookies
        body: JSON.stringify({ email, password }),
      })

      setDebugInfo(`Respuesta: ${response.status} ${response.statusText}`)

      if (!response.ok) {
        const data = await response.json()
        const errorMsg = data.error || `Error ${response.status}`
        setError(errorMsg)
        setDebugInfo(`Error: ${errorMsg}`)
        console.error('Login error:', data)
        return
      }

      const data = await response.json()
      setDebugInfo(`Login exitoso! Redirigiendo a feed...`)
      console.log('Login successful:', data)

      // Pequeño delay para asegurar que la cookie se procese
      await new Promise(resolve => setTimeout(resolve, 100))

      // Usar window.location para una redirección más confiable
      window.location.href = '/feed'
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error en la conexión: ${errorMsg}`)
      setDebugInfo(`Exception: ${errorMsg}`)
      console.error('Login exception:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Social Media QA</h1>
        <p className="text-gray-600">Inicia sesión en tu cuenta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
            <div className="font-semibold">❌ {error}</div>
          </div>
        )}

        {debugInfo && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-2 rounded text-xs font-mono">
            {debugInfo}
          </div>
        )}

        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:bg-white text-sm"
            required
            disabled={loading}
          />
        </div>

        <div>
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded bg-gray-50 focus:bg-white text-sm"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600 disabled:bg-gray-300 transition"
        >
          {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
        </button>
      </form>

      <div className="mt-6 text-center border-t border-gray-200 pt-6">
        <p className="text-gray-600 text-sm mb-2">¿No tienes cuenta?</p>
        <Link href="/signup" className="text-blue-500 font-semibold hover:text-blue-700">
          Regístrate aquí
        </Link>
      </div>

      <div className="mt-6 p-3 bg-gray-100 rounded text-xs text-gray-600">
        <p className="font-semibold mb-1">📝 Credenciales de prueba:</p>
        <p>Email: <strong>usuario1@test.com</strong></p>
        <p>Contraseña: <strong>password123</strong></p>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'

interface MessageButtonProps {
  userId: string
  username: string
}

export default function MessageButton({ userId, username }: MessageButtonProps) {
  const [showModal, setShowModal] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/messages/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: message }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setMessage('')
      setSuccess(true)
      setTimeout(() => {
        setShowModal(false)
        setSuccess(false)
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-6 py-2 bg-gray-500 text-white rounded font-semibold hover:bg-gray-600 transition"
      >
        💬 Mensaje
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Enviar mensaje a @{username}</h2>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribe tu mensaje..."
              rows={4}
              className="w-full p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              disabled={loading || success}
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            {success && <p className="text-green-500 text-sm mb-4">✓ Mensaje enviado</p>}

            <div className="flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                disabled={loading || success}
                className="flex-1 px-4 py-2 bg-gray-200 rounded font-semibold hover:bg-gray-300 disabled:opacity-50 transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleSend}
                disabled={loading || !message.trim() || success}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 disabled:opacity-50 transition"
              >
                {loading ? 'Enviando...' : success ? '✓ Enviado' : 'Enviar'}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
              <Link
                href={`/messages/${userId}`}
                className="text-blue-500 hover:underline text-sm"
                onClick={() => setShowModal(false)}
              >
                Ver conversación →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

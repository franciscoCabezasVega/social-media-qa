'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface MessageFormProps {
  userId: string
}

export default function MessageForm({ userId }: MessageFormProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!text.trim()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/messages/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      setText('')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Message error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value.split('\n')[0])}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit(e as any)
          }
        }}
        placeholder="Escribe un mensaje..."
        rows={1}
        className="flex-1 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
        disabled={loading}
      />
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="px-4 py-3 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition flex-shrink-0"
      >
        {loading ? '...' : '→'}
      </button>
    </form>
  )
}

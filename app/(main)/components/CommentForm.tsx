'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CommentFormProps {
  postId: string
  onCommentAdded?: () => void
}

export default function CommentForm({ postId, onCommentAdded }: CommentFormProps) {
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
      const response = await fetch(`/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text.trim() }),
      })

      if (!response.ok) {
        throw new Error('Failed to add comment')
      }

      // Clear form
      setText('')

      // Refresh página para mostrar el nuevo comentario
      router.refresh()

      onCommentAdded?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Comment error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex gap-2">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Añade un comentario..."
          rows={3}
          className="flex-1 p-3 border border-gray-300 rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>
      {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      <button
        type="submit"
        disabled={loading || !text.trim()}
        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded font-semibold hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {loading ? 'Publicando...' : 'Comentar'}
      </button>
    </form>
  )
}

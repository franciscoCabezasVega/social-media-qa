'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface FollowButtonProps {
  userId: string
  initialFollowing: boolean
  onFollowChange?: (following: boolean) => void
}

export default function FollowButton({
  userId,
  initialFollowing,
  onFollowChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleClick = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/users/${userId}/follow`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to follow/unfollow')
      }

      const data = await response.json()
      const newFollowing = data.following

      // Optimistic update
      setFollowing(newFollowing)
      onFollowChange?.(newFollowing)

      // Refresh página para mostrar cambios en contadores
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      console.error('Follow error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`px-6 py-2 rounded font-semibold transition ${
        following
          ? 'bg-gray-200 hover:bg-gray-300 text-black'
          : 'bg-blue-500 hover:bg-blue-600 text-white'
      } disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {loading ? 'Cargando...' : following ? 'Dejar de seguir' : 'Seguir'}
    </button>
  )
}

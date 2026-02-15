'use client'

import { useState } from 'react'

interface LikeButtonProps {
  postId: string
  initialLiked: boolean
  initialLikeCount: number
  onLikeChange?: (liked: boolean, count: number) => void
}

export default function LikeButton({
  postId,
  initialLiked,
  initialLikeCount,
  onLikeChange,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [loading, setLoading] = useState(false)

  const handleLike = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Failed to like post')
      }

      const data = await response.json()
      const newLiked = data.liked

      // Optimistic update
      setLiked(newLiked)
      const newCount = newLiked ? likeCount + 1 : likeCount - 1
      setLikeCount(newCount)
      onLikeChange?.(newLiked, newCount)
    } catch (err) {
      console.error('Like error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={loading}
      className="flex items-center gap-2 text-gray-600 hover:text-red-500 transition disabled:opacity-50"
    >
      <span className={`text-xl transition ${liked ? 'text-red-500' : ''}`}>
        {liked ? '❤️' : '🤍'}
      </span>
      <span>{likeCount}</span>
    </button>
  )
}

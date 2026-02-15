import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { followUser, unfollowUser, isFollowing } from '@/app/lib/db'

/**
 * SEGUIR/DEJAR DE SEGUIR USUARIO
 * POST /api/users/[userId]/follow
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const targetUserId = userId

    // No puedes seguirte a ti mismo
    if (session.userId === targetUserId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      )
    }

    // Verificar si ya sigue
    const isCurrentlyFollowing = await isFollowing(session.userId, targetUserId)

    if (isCurrentlyFollowing) {
      // Unfollow
      await unfollowUser(session.userId, targetUserId)
      return NextResponse.json({ following: false })
    } else {
      // Follow
      await followUser(session.userId, targetUserId)
      return NextResponse.json({ following: true })
    }
  } catch (error) {
    console.error('Follow error:', error)
    return NextResponse.json(
      { error: 'Failed to follow/unfollow' },
      { status: 500 }
    )
  }
}

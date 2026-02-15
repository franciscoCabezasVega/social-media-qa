import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { likePost, unlikePost, hasUserLikedPost } from '@/app/lib/db'
import { revalidatePath } from 'next/cache'

/**
 * LIKE/UNLIKE POST
 * POST /api/posts/[postId]/like
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

      // Verificar si ya dio like
    const hasLiked = await hasUserLikedPost(postId, session.userId)

    if (hasLiked) {
      // Unlike
      await unlikePost(postId, session.userId)
      revalidatePath(`/post/${postId}`)
      revalidatePath('/feed')
      revalidatePath('/explore')
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await likePost(postId, session.userId)
      revalidatePath(`/post/${postId}`)
      revalidatePath('/feed')
      revalidatePath('/explore')
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error('Like error:', error)
    return NextResponse.json(
      { error: 'Failed to like post' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { CreatePostSchema } from '@/app/lib/validate'
import { createPost, getNextId } from '@/app/lib/db'
import { generateId } from '@/app/lib/utils'

/**
 * CREAR POST
 * POST /api/posts
 */

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Validar
    const validation = CreatePostSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data' },
        { status: 400 }
      )
    }

    const { caption, image } = validation.data
    const now = Date.now()
    const postId = generateId('post', await getNextId('post'))

    // Crear post
    await createPost({
      id: postId,
      userId: session.userId,
      caption,
      image,
      createdAt: now,
      updatedAt: now,
      likeCount: 0,
      commentCount: 0,
    })

    return NextResponse.json(
      { id: postId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create post error:', error)
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    )
  }
}

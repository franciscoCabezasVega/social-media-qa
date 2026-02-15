import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { CreateCommentSchema } from '@/app/lib/validate'
import { createComment, getPostComments } from '@/app/lib/db'
import { generateId } from '@/app/lib/utils'
import { revalidatePath } from 'next/cache'

/**
 * COMENTAR POST
 * GET - Obtener comentarios
 * POST - Crear comentario
 * /api/posts/[postId]/comment
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  const { postId } = await params
  try {
    const comments = await getPostComments(postId)
    return NextResponse.json({ comments })
  } catch (error) {
    console.error('Get comments error:', error)
    return NextResponse.json(
      { error: 'Failed to get comments' },
      { status: 500 }
    )
  }
}

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

    const body = await request.json()

    // Validar
    const validation = CreateCommentSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data' },
        { status: 400 }
      )
    }

    const { text } = validation.data
    const commentId = generateId('comment')
    const now = Date.now()

    // Crear comentario
    await createComment({
      id: commentId,
      postId,
      userId: session.userId,
      text,
      createdAt: now,
    })

    // Revalidar caché
    revalidatePath(`/post/${postId}`)
    revalidatePath('/feed')

    return NextResponse.json(
      { id: commentId },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create comment error:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

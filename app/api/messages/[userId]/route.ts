import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { createMessage, getConversation } from '@/app/lib/db'
import { generateId } from '@/app/lib/utils'

/**
 * OBTENER CONVERSACIÓN CON UN USUARIO
 * GET /api/messages/[userId]
 */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await getConversation(session.userId, userId, 0, 100)
    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to get conversation' },
      { status: 500 }
    )
  }
}

/**
 * ENVIAR MENSAJE A UN USUARIO
 * POST /api/messages/[userId]
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // No se puede enviar mensaje a sí mismo
    if (session.userId === userId) {
      return NextResponse.json(
        { error: 'Cannot send message to yourself' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const { text } = body

    if (!text || !text.trim()) {
      return NextResponse.json(
        { error: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    const messageId = generateId('msg')
    const now = Date.now()

    await createMessage({
      id: messageId,
      senderId: session.userId,
      receiverId: userId,
      text: text.trim(),
      createdAt: now,
      isRead: false,
    })

    return NextResponse.json(
      { id: messageId, text: text.trim(), createdAt: now },
      { status: 201 }
    )
  } catch (error) {
    console.error('Send message error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}

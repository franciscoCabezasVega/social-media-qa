import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { getConversation, markMessageAsRead } from '@/app/lib/db'

/**
 * MARCAR MENSAJES COMO LEÍDOS
 * POST /api/messages/[userId]/read
 *
 * Marca todos los mensajes no leídos recibidos de un usuario como leídos
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

    // Obtener conversación entre el usuario actual y el otro usuario
    const messages = await getConversation(session.userId, userId, 0, 1000)

    // Filtrar mensajes no leídos que fueron recibidos por el usuario actual
    const unreadMessages = messages.filter(
      (msg) => msg.receiverId === session.userId && !msg.isRead
    )

    // Marcar todos como leídos
    await Promise.all(unreadMessages.map((msg) => markMessageAsRead(msg.id)))

    return NextResponse.json({ markedCount: unreadMessages.length })
  } catch (error) {
    console.error('Mark messages as read error:', error)
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    )
  }
}

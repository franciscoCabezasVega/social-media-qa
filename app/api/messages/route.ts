import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/app/lib/auth'
import { getUserMessages, getUnreadMessageCount } from '@/app/lib/db'

/**
 * OBTENER MENSAJES DEL USUARIO
 * GET /api/messages
 */

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const messages = await getUserMessages(session.userId, 0, 50)
    const unreadCount = await getUnreadMessageCount(session.userId)

    return NextResponse.json({ messages, unreadCount })
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Failed to get messages' },
      { status: 500 }
    )
  }
}

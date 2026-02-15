import { getSession } from '@/app/lib/auth'
import { getUserMessages, getUserById } from '@/app/lib/db'
import { redirect } from 'next/navigation'
import MessagesList from '@/app/(main)/components/MessagesList'

/**
 * PÁGINA DE BANDEJA DE MENSAJES
 * Server Component que obtiene datos iniciales y delega al cliente
 */

export const dynamic = 'force-dynamic'

export default async function MessagesPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const messages = await getUserMessages(session.userId, 0, 100)

  // Agrupar mensajes por usuario (obtener la conversación más reciente de cada usuario)
  const conversationMap = new Map<string, any>()

  for (const msg of messages) {
    const otherUserId = msg.senderId === session.userId ? msg.receiverId : msg.senderId
    const key = otherUserId

    if (!conversationMap.has(key)) {
      const otherUser = await getUserById(otherUserId)
      conversationMap.set(key, {
        userId: otherUserId,
        user: otherUser,
        lastMessage: msg.text,
        lastMessageTime: msg.createdAt,
        isRead: msg.isRead || msg.senderId === session.userId,
      })
    }
  }

  const conversations = Array.from(conversationMap.values()).sort(
    (a, b) => b.lastMessageTime - a.lastMessageTime
  )

  return <MessagesList initialConversations={conversations} />
}

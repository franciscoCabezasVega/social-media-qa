import { getSession } from '@/app/lib/auth'
import { getUserMessages, getUserById } from '@/app/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

/**
 * PÁGINA DE BANDEJA DE MENSAJES
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

  const conversations = Array.from(conversationMap.values())
    .sort((a, b) => b.lastMessageTime - a.lastMessageTime)

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer'
    } else {
      return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Mensajes</h1>

      {conversations.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-6">Sin mensajes aún</p>
          <Link href="/explore" className="text-blue-500 hover:underline">
            Explorar usuarios
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link
              key={conv.userId}
              href={`/messages/${conv.userId}`}
              className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                  {conv.user?.profileImage && (
                    <img
                      src={conv.user.profileImage}
                      alt={conv.user.username}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold">@{conv.user?.username}</h3>
                    <p className="text-gray-500 text-sm ml-2">{formatTime(conv.lastMessageTime)}</p>
                  </div>
                  <p className="text-gray-600 text-sm truncate">{conv.lastMessage}</p>
                </div>
                {!conv.isRead && (
                  <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0 mt-3" />
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

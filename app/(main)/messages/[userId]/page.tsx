import { getSession } from '@/app/lib/auth'
import { getUserById, getConversation } from '@/app/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import MessageForm from '@/app/(main)/components/MessageForm'

/**
 * PÁGINA DE CONVERSACIÓN DE MENSAJES
 */

export const dynamic = 'force-dynamic'

export default async function MessagesPage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  if (session.userId === userId) {
    redirect('/feed')
  }

  const otherUser = await getUserById(userId)

  if (!otherUser) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Usuario no encontrado</h1>
        <Link href="/feed" className="text-blue-500 hover:underline">
          Volver al feed
        </Link>
      </div>
    )
  }

  const messages = await getConversation(session.userId, userId, 0, 100)

  // Formatear fecha
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
    <div className="max-w-2xl mx-auto p-6 h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
        <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          {otherUser.profileImage && (
            <img
              src={otherUser.profileImage}
              alt={otherUser.username}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <Link
            href={`/profile/${otherUser.username}`}
            className="font-semibold hover:text-blue-500"
          >
            {otherUser.username}
          </Link>
          <p className="text-gray-500 text-sm">{otherUser.fullName}</p>
        </div>
        <Link href="/feed" className="text-gray-500 hover:text-gray-700">
          ✕
        </Link>
      </div>

      {/* Mensajes */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>No hay mensajes aún. ¡Sé el primero en escribir!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.senderId === session.userId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === session.userId
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-black rounded-bl-none'
                }`}
              >
                <p className="break-words">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.senderId === session.userId ? 'text-blue-100' : 'text-gray-500'}`}>
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario */}
      <MessageForm userId={userId} />
    </div>
  )
}

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Message, User } from '@/app/lib/db'

interface Conversation {
  userId: string
  user: User | null
  lastMessage: string
  lastMessageTime: number
  isRead: boolean
}

interface MessagesListProps {
  initialConversations: Conversation[]
}

/**
 * COMPONENTE DE LISTA DE MENSAJES
 * Muestra conversaciones con polling cada 15 segundos
 * Incluye botón de refresh manual
 */

export default function MessagesList({ initialConversations }: MessagesListProps) {
  const [conversations, setConversations] = useState(initialConversations)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  const refresh = useCallback(async () => {
    setRefreshing(true)
    router.refresh()
    // Pequeña espera para que el servidor procese
    await new Promise((r) => setTimeout(r, 500))
    setRefreshing(false)
  }, [router])

  // Actualizar conversaciones cuando cambian los props iniciales
  useEffect(() => {
    setConversations(initialConversations)
  }, [initialConversations])

  // Polling cada 15 segundos
  useEffect(() => {
    const interval = setInterval(refresh, 15000)
    return () => clearInterval(interval)
  }, [refresh])

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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mensajes</h1>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50"
          title="Actualizar mensajes"
        >
          <span className={`text-lg ${refreshing ? 'animate-spin' : ''}`}>↻</span>
        </button>
      </div>

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
                    <p className="text-gray-500 text-sm ml-2">
                      {formatTime(conv.lastMessageTime)}
                    </p>
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

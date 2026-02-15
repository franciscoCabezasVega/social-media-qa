'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import MessageForm from './MessageForm'
import { Message, User } from '@/app/lib/db'

interface ConversationMessagesProps {
  initialMessages: Message[]
  otherUser: User | null
  currentUserId: string
}

/**
 * COMPONENTE DE VISTA DE CONVERSACIÓN
 * Muestra mensajes entre dos usuarios con:
 * - Polling cada 5 segundos
 * - Auto-marca como leído al abrir
 * - Botón de refresh manual
 */

export default function ConversationMessages({
  initialMessages,
  otherUser,
  currentUserId,
}: ConversationMessagesProps) {
  const [messages, setMessages] = useState(initialMessages)
  const [refreshing, setRefreshing] = useState(false)
  const router = useRouter()

  // Al montar el componente, marcar mensajes como leídos
  useEffect(() => {
    if (!otherUser) return

    const markAsRead = async () => {
      try {
        await fetch(`/api/messages/${otherUser.id}/read`, { method: 'POST' })
      } catch (error) {
        console.error('Error marking messages as read:', error)
      }
    }

    markAsRead()
  }, [otherUser?.id])

  const refresh = useCallback(async () => {
    setRefreshing(true)
    router.refresh()
    // Pequeña espera para que el servidor procese
    await new Promise((r) => setTimeout(r, 300))
    setRefreshing(false)
  }, [router])

  // Actualizar mensajes cuando cambian los props iniciales
  useEffect(() => {
    setMessages(initialMessages)
  }, [initialMessages])

  // Polling cada 5 segundos
  useEffect(() => {
    const interval = setInterval(refresh, 5000)
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
        <button
          onClick={refresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-100 rounded transition disabled:opacity-50 mr-2"
          title="Actualizar mensajes"
        >
          <span className={`text-lg ${refreshing ? 'animate-spin' : ''}`}>↻</span>
        </button>
        <Link href="/messages" className="text-gray-500 hover:text-gray-700">
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
              className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.senderId === currentUserId
                    ? 'bg-blue-500 text-white rounded-br-none'
                    : 'bg-gray-200 text-black rounded-bl-none'
                }`}
              >
                <p className="break-words">{msg.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    msg.senderId === currentUserId ? 'text-blue-100' : 'text-gray-500'
                  }`}
                >
                  {formatTime(msg.createdAt)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Formulario */}
      <MessageForm userId={otherUser.id} />
    </div>
  )
}

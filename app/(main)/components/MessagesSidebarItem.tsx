'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

/**
 * COMPONENTE DE MENSAJES EN EL SIDEBAR
 * Muestra enlace a mensajes con contador de no leídos
 * Actualiza automáticamente cada 10 segundos
 */

export default function MessagesSidebarItem() {
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    const fetchUnread = async () => {
      try {
        const res = await fetch('/api/messages')
        if (res.ok) {
          const data = await res.json()
          setUnreadCount(data.unreadCount || 0)
        }
      } catch (error) {
        console.error('Error fetching unread count:', error)
      }
    }

    // Llamada inicial
    fetchUnread()

    // Polling cada 10 segundos
    const interval = setInterval(fetchUnread, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      <Link
        href="/messages"
        className="block px-4 py-2 rounded hover:bg-gray-100 transition font-semibold text-lg"
      >
        💬 Mensajes
      </Link>
      {unreadCount > 0 && (
        <span className="absolute top-1 right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </div>
  )
}

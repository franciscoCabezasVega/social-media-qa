import { getSession } from '@/app/lib/auth'
import { getUserById, getConversation } from '@/app/lib/db'
import { redirect } from 'next/navigation'
import ConversationMessages from '@/app/(main)/components/ConversationMessages'

/**
 * PÁGINA DE CONVERSACIÓN DE MENSAJES
 * Server Component que obtiene datos iniciales y delega al cliente
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
  const messages = await getConversation(session.userId, userId, 0, 100)

  return (
    <ConversationMessages
      initialMessages={messages}
      otherUser={otherUser}
      currentUserId={session.userId}
    />
  )
}

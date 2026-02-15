import { redirect } from 'next/navigation'
import { getSession } from '@/app/lib/auth'

/**
 * PÁGINA PRINCIPAL
 * Redirige a /feed si está autenticado, o a /login si no
 */

export default async function Home() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  redirect('/feed')
}

import { getSession } from '@/app/lib/auth'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { LogoutButton } from './logout-button'

/**
 * LAYOUT PRINCIPAL PARA USUARIOS AUTENTICADOS
 */

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-200 p-6">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Social Media QA</h1>
        </div>

        <nav className="space-y-4">
          <NavLink href="/feed" label="🏠 Feed" />
          <NavLink href="/explore" label="🔍 Explorar" />
          <NavLink href={`/profile/${session.username}`} label="👤 Perfil" />
          <NavLink href="/post/create" label="➕ Crear" />
        </nav>

        <div className="mt-auto pt-10 border-t border-gray-200">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="block px-4 py-2 rounded hover:bg-gray-100 transition font-semibold text-lg"
    >
      {label}
    </Link>
  )
}

'use client'

/**
 * Botón de Logout - Client Component
 * Necesario para usar onClick y manejo de eventos
 */

export function LogoutButton() {
  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      })

      if (response.ok) {
        // Redirigir a login después de logout exitoso
        window.location.href = '/login'
      } else {
        console.error('Logout failed:', response.status)
        alert('Error al cerrar sesión')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error al cerrar sesión')
    }
  }

  return (
    <button
      onClick={handleLogout}
      className="w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded font-semibold transition"
    >
      Cerrar sesión
    </button>
  )
}

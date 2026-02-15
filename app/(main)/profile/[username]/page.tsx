import { getSession } from '@/app/lib/auth'
import { getUserByUsername, getUserPosts, getFollowerCount, getFollowingCount, isFollowing, getFollowers, type Post } from '@/app/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import FollowButton from '@/app/(main)/components/FollowButton'

/**
 * PÁGINA DE PERFIL DE USUARIO
 */

// Deshabilitar caché para obtener datos actualizados siempre
export const dynamic = 'force-dynamic'

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const { username } = await params
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const user = await getUserByUsername(username)

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Usuario no encontrado</h1>
        <Link href="/feed" className="text-blue-500">
          Volver al feed
        </Link>
      </div>
    )
  }

  const isOwnProfile = session.userId === user.id

  // Verificar privacidad del perfil
  if (user.isPrivate && !isOwnProfile) {
    const followersList = await getFollowers(user.id)
    const isFollower = followersList.some((follower) => follower.id === session.userId)
    if (!isFollower) {
      return (
        <div className="max-w-2xl mx-auto p-6 text-center">
          <div className="py-12">
            <h1 className="text-2xl font-bold mb-4">🔒 Perfil privado</h1>
            <p className="text-gray-600 mb-6">Este perfil es privado. Solo los seguidores de este usuario pueden verlo.</p>
            <Link href="/feed" className="text-blue-500 hover:underline">
              Volver al feed
            </Link>
          </div>
        </div>
      )
    }
  }

  const posts = await getUserPosts(user.id, 0, 12)
  const followerCount = await getFollowerCount(user.id)
  const followingCount = await getFollowingCount(user.id)
  const isCurrentUserFollowing = await isFollowing(session.userId, user.id)

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Profile Header */}
      <div className="flex gap-8 mb-8">
        <div className="w-32 h-32 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          {user.profileImage && (
            <img
              src={user.profileImage}
              alt={user.username}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold">{user.username}</h1>
              {user.isPrivate && <p className="text-sm text-gray-500">🔒 Perfil privado</p>}
            </div>
            {isOwnProfile ? (
              <Link
                href="/profile/edit"
                className="px-6 py-2 bg-gray-200 rounded font-semibold hover:bg-gray-300"
              >
                Editar perfil
              </Link>
            ) : (
              <FollowButton userId={user.id} initialFollowing={isCurrentUserFollowing} />
            )}
          </div>

          <div className="flex gap-8 mb-4">
            <div>
              <strong>{posts.length}</strong> <span className="text-gray-500">posts</span>
            </div>
            <div>
              <strong>{followerCount}</strong> <span className="text-gray-500">seguidores</span>
            </div>
            <div>
              <strong>{followingCount}</strong> <span className="text-gray-500">seguidos</span>
            </div>
          </div>

          <div>
            <p className="font-semibold">{user.fullName}</p>
            {user.bio && <p className="text-gray-600">{user.bio}</p>}
          </div>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="border-t border-gray-200 pt-8">
        <h2 className="text-lg font-bold mb-6">Posts</h2>
        {posts.length === 0 ? (
          <p className="text-gray-500 text-center py-12">
            Sin posts aún
          </p>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {posts.map((post: Post) => (
              <div key={post.id} className="aspect-square rounded overflow-hidden">
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover hover:opacity-80 transition cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

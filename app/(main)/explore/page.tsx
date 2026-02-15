import { getSession } from '@/app/lib/auth'
import { getGlobalPosts, type Post } from '@/app/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'

/**
 * PÁGINA DE EXPLORACIÓN
 */

export default async function ExplorePage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const posts = await getGlobalPosts(0, 30)

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Explorar</h1>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay posts aún
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {posts.map((post: Post) => (
            <Link key={post.id} href={`/post/${post.id}`}>
              <div className="aspect-square rounded overflow-hidden group relative">
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover group-hover:opacity-80 transition"
                />
                {/* Overlay con stats */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white text-center">
                    <div className="text-2xl font-bold">❤️ {post.likeCount}</div>
                    <div className="text-lg">💬 {post.commentCount}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

import { getSession } from '@/app/lib/auth'
import { getGlobalPosts, type Post } from '@/app/lib/db'
import { redirect } from 'next/navigation'

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
  )
}

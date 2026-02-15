import { getSession } from '@/app/lib/auth'
import { getUserFeed, type Post } from '@/app/lib/db'
import { redirect } from 'next/navigation'

/**
 * PÁGINA DE FEED
 */

export default async function FeedPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const posts = await getUserFeed(session.userId, 0, 20)

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Feed</h1>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            No hay posts aún. ¡Sigue a usuarios para ver su contenido!
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {posts.map((post: Post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  return (
    <article className="border border-gray-200 rounded-lg p-4">
      <div className="mb-4">
        <h3 className="font-semibold">{post.caption}</h3>
      </div>
      <div className="mb-4 bg-gray-100 aspect-square rounded flex items-center justify-center">
        <img src={post.image} alt="" className="w-full h-full object-cover rounded" />
      </div>
      <div className="flex space-x-4 text-gray-600">
        <button>❤️ {post.likeCount}</button>
        <button>💬 {post.commentCount}</button>
        <button>🔖</button>
      </div>
    </article>
  )
}

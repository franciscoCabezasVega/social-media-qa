import { getSession } from '@/app/lib/auth'
import { getUserFeed, getUserById, hasUserLikedPost, type Post } from '@/app/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LikeButton from '@/app/(main)/components/LikeButton'

/**
 * PÁGINA DE FEED
 */

export const dynamic = 'force-dynamic'

export default async function FeedPage() {
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const posts = await getUserFeed(session.userId, 0, 20)

  // Enriquecer posts con info del autor y estado de likes
  const postsWithDetails = await Promise.all(
    posts.map(async (post) => ({
      ...post,
      author: await getUserById(post.userId),
      hasLiked: await hasUserLikedPost(post.id, session.userId),
    }))
  )

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
          {postsWithDetails.map((post) => (
            <PostCard key={post.id} post={post} userId={session.userId} />
          ))}
        </div>
      )}
    </div>
  )
}

interface PostCardProps {
  post: Post & { author?: any; hasLiked: boolean }
  userId: string
}

function PostCard({ post, userId }: PostCardProps) {
  return (
    <article className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Autor */}
      <div className="p-4 border-b border-gray-200 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
          {post.author?.profileImage && (
            <img
              src={post.author.profileImage}
              alt={post.author.username}
              className="w-full h-full object-cover"
            />
          )}
        </div>
        <div className="flex-1">
          <Link
            href={`/profile/${post.author?.username}`}
            className="font-semibold hover:text-blue-500"
          >
            {post.author?.username}
          </Link>
          <p className="text-gray-500 text-sm">{post.author?.fullName}</p>
        </div>
      </div>

      {/* Caption */}
      {post.caption && (
        <div className="px-4 pt-4">
          <p className="text-gray-800">{post.caption}</p>
        </div>
      )}

      {/* Imagen */}
      <Link href={`/post/${post.id}`} className="block mt-4">
        <div className="bg-gray-100 aspect-square flex items-center justify-center hover:opacity-90 transition">
          <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
        </div>
      </Link>

      {/* Acciones */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-6 mb-3">
          <LikeButton postId={post.id} initialLiked={post.hasLiked} initialLikeCount={post.likeCount} />
          <Link href={`/post/${post.id}`} className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
            <span className="text-xl">💬</span>
            <span>{post.commentCount}</span>
          </Link>
        </div>
      </div>
    </article>
  )
}

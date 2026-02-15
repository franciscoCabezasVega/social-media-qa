import { getSession } from '@/app/lib/auth'
import {
  getPostById,
  getUserById,
  getPostComments,
  hasUserLikedPost,
  type Comment,
} from '@/app/lib/db'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import LikeButton from '@/app/(main)/components/LikeButton'
import CommentForm from '@/app/(main)/components/CommentForm'

/**
 * PÁGINA DE DETALLE DE PUBLICACIÓN
 */

export const dynamic = 'force-dynamic'

interface CommentWithUser extends Comment {
  user?: any
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ postId: string }>
}) {
  const { postId } = await params
  const session = await getSession()

  if (!session) {
    redirect('/login')
  }

  const post = await getPostById(postId)

  if (!post) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Publicación no encontrada</h1>
        <Link href="/explore" className="text-blue-500 hover:underline">
          Volver a Explorar
        </Link>
      </div>
    )
  }

  const author = await getUserById(post.userId)
  const comments = await getPostComments(postId)
  const hasLiked = await hasUserLikedPost(postId, session.userId)

  // Enriquecer comentarios con info del usuario
  const commentsWithUsers: CommentWithUser[] = await Promise.all(
    comments.map(async (comment) => ({
      ...comment,
      user: await getUserById(comment.userId),
    }))
  )

  // Formatear fecha
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      {/* Post Card */}
      <article className="border border-gray-200 rounded-lg overflow-hidden mb-8">
        {/* Autor */}
        <div className="p-4 border-b border-gray-200 flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
            {author?.profileImage && (
              <img
                src={author.profileImage}
                alt={author.username}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1">
            <Link
              href={`/profile/${author?.username}`}
              className="font-semibold hover:text-blue-500"
            >
              {author?.username}
            </Link>
            <p className="text-gray-500 text-sm">{author?.fullName}</p>
          </div>
        </div>

        {/* Imagen */}
        <div className="bg-gray-100 aspect-square flex items-center justify-center">
          <img src={post.image} alt={post.caption} className="w-full h-full object-cover" />
        </div>

        {/* Metadata y acciones */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-4 mb-4">
            <LikeButton postId={postId} initialLiked={hasLiked} initialLikeCount={post.likeCount} />
            <button className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition">
              <span className="text-xl">💬</span>
              <span>{post.commentCount}</span>
            </button>
          </div>

          {/* Caption */}
          {post.caption && (
            <div className="mt-4">
              <p className="font-semibold mb-2">{author?.username}</p>
              <p className="text-gray-800">{post.caption}</p>
            </div>
          )}

          {/* Fecha */}
          <p className="text-gray-500 text-sm mt-4">{formatDate(post.createdAt)}</p>
        </div>

        {/* Comentarios */}
        <div className="p-4">
          <h3 className="font-semibold mb-4">Comentarios ({comments.length})</h3>

          {comments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Sin comentarios aún</p>
          ) : (
            <div className="space-y-4 mb-6">
              {commentsWithUsers.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                    {comment.user?.profileImage && (
                      <img
                        src={comment.user.profileImage}
                        alt={comment.user.username}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <Link
                      href={`/profile/${comment.user?.username}`}
                      className="font-semibold text-sm hover:text-blue-500"
                    >
                      {comment.user?.username}
                    </Link>
                    <p className="text-gray-800 text-sm">{comment.text}</p>
                    <p className="text-gray-500 text-xs mt-1">{formatDate(comment.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Formulario de comentario */}
          <CommentForm postId={postId} />
        </div>
      </article>

      {/* Volver */}
      <Link href="/explore" className="text-blue-500 hover:underline">
        ← Volver a Explorar
      </Link>
    </div>
  )
}

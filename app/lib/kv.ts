import { kv } from '@vercel/kv'

/**
 * REPOSITORY PATTERN PARA VERCEL KV
 * Abstracción completa de la BD para fácil migración futura
 */

// ==================== TIPOS ====================

export interface User {
  id: string
  email: string
  username: string
  password: string // bcrypt hash
  fullName: string
  bio: string
  profileImage?: string
  createdAt: number
  updatedAt: number
  isPrivate: boolean
}

export interface Post {
  id: string
  userId: string
  caption: string
  image: string
  createdAt: number
  updatedAt: number
  likeCount: number
  commentCount: number
}

export interface Comment {
  id: string
  postId: string
  userId: string
  text: string
  createdAt: number
}

// ==================== COUNTERS ====================

export async function getNextId(type: 'user' | 'post' | 'comment'): Promise<number> {
  const key = `counters:${type}s`
  const id = await kv.incr(key)
  return id
}

// ==================== USUARIOS ====================

export async function createUser(user: User): Promise<void> {
  await Promise.all([
    kv.hset(`users:${user.id}`, {
      id: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      bio: user.bio,
      profileImage: user.profileImage || '',
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      isPrivate: user.isPrivate,
    }),
    kv.set(`users:email:${user.email.toLowerCase()}`, user.id),
    kv.set(`users:username:${user.username.toLowerCase()}`, user.id),
    kv.hset(`users:${user.id}:password`, { hash: user.password }),
    kv.sadd(`users:${user.id}:followers`, []), // Set vacío
    kv.sadd(`users:${user.id}:following`, []), // Set vacío
  ])
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = await kv.hgetall(`users:${userId}`) as any
  if (!user || !user.id) return null
  return user as User
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const userId = await kv.get<string>(`users:email:${email.toLowerCase()}`)
  if (!userId) return null
  return getUserById(userId)
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const userId = await kv.get<string>(`users:username:${username.toLowerCase()}`)
  if (!userId) return null
  return getUserById(userId)
}

export async function getUserPassword(userId: string): Promise<string | null> {
  const result = await kv.hget(`users:${userId}:password`, 'hash') as string | null
  return result
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const data: any = {
    ...updates,
    updatedAt: Date.now(),
  }
  delete data.password // No actualizar contraseña aquí
  await kv.hset(`users:${userId}`, data)
}

export async function searchUsers(query: string, limit = 20): Promise<User[]> {
  // Redis no tiene búsqueda de texto full. Implementación simple:
  // Buscar por username exacto o inicio
  const username = query.toLowerCase()
  const userId = await kv.get<string>(`users:username:${username}`)
  if (!userId) return []
  const user = await getUserById(userId)
  return user ? [user] : []
}

// ==================== POST ====================

export async function createPost(post: Post): Promise<void> {
  await Promise.all([
    kv.hset(`posts:${post.id}`, {
      id: post.id,
      userId: post.userId,
      caption: post.caption,
      image: post.image,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      likeCount: post.likeCount,
      commentCount: post.commentCount,
    }),
    kv.zadd(`user:${post.userId}:posts`, {
      score: post.createdAt,
      member: post.id,
    }),
    kv.zadd('posts:global', {
      score: post.createdAt,
      member: post.id,
    }),
    kv.sadd(`posts:${post.id}:likes`, []),
    kv.sadd(`posts:${post.id}:comments`, []),
  ])
}

export async function getPostById(postId: string): Promise<Post | null> {
  const post = await kv.hgetall(`posts:${postId}`) as any
  if (!post || !post.id) return null
  return post as Post
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<void> {
  const data: any = {
    ...updates,
    updatedAt: Date.now(),
  }
  await kv.hset(`posts:${postId}`, data)
}

export async function deletePost(postId: string): Promise<void> {
  const post = await getPostById(postId)
  if (!post) return

  await Promise.all([
    kv.del(`posts:${postId}`),
    kv.del(`posts:${postId}:likes`),
    kv.del(`posts:${postId}:comments`),
    kv.zrem(`user:${post.userId}:posts`, postId),
    kv.zrem('posts:global', postId),
  ])
}

export async function getUserPosts(userId: string, offset = 0, limit = 10): Promise<Post[]> {
  const postIds = await kv.zrange(`user:${userId}:posts`, -offset - limit, -offset - 1, {
    rev: true,
  }) as string[]

  if (!postIds.length) return []

  const posts = await Promise.all(postIds.map(id => getPostById(id)))
  return posts.filter((p): p is Post => p !== null)
}

export async function getGlobalPosts(offset = 0, limit = 20): Promise<Post[]> {
  const postIds = await kv.zrange('posts:global', -offset - limit, -offset - 1, {
    rev: true,
  }) as string[]

  if (!postIds.length) return []

  const posts = await Promise.all(postIds.map(id => getPostById(id)))
  return posts.filter((p): p is Post => p !== null)
}

// ==================== LIKES ====================

export async function likePost(postId: string, userId: string): Promise<void> {
  const post = await getPostById(postId)
  if (!post) return

  await Promise.all([
    kv.sadd(`posts:${postId}:likes`, userId),
    kv.hset(`posts:${postId}`, {
      likeCount: post.likeCount + 1,
      updatedAt: Date.now(),
    }),
  ])
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  const post = await getPostById(postId)
  if (!post) return

  await Promise.all([
    kv.srem(`posts:${postId}:likes`, userId),
    kv.hset(`posts:${postId}`, {
      likeCount: Math.max(0, post.likeCount - 1),
      updatedAt: Date.now(),
    }),
  ])
}

export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const result = await kv.sismember(`posts:${postId}:likes`, userId)
  return result === 1
}

export async function getPostLikes(postId: string): Promise<string[]> {
  const likes = await kv.smembers(`posts:${postId}:likes`) as string[]
  return likes || []
}

// ==================== COMENTARIOS ====================

export async function createComment(comment: Comment): Promise<void> {
  const post = await getPostById(comment.postId)
  if (!post) return

  await Promise.all([
    kv.hset(`comments:${comment.id}`, {
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      text: comment.text,
      createdAt: comment.createdAt,
    }),
    kv.sadd(`posts:${comment.postId}:comments`, comment.id),
    kv.hset(`posts:${comment.postId}`, {
      commentCount: post.commentCount + 1,
      updatedAt: Date.now(),
    }),
  ])
}

export async function getComment(commentId: string): Promise<Comment | null> {
  const comment = await kv.hgetall(`comments:${commentId}`) as any
  if (!comment || !comment.id) return null
  return comment as Comment
}

export async function deleteComment(commentId: string): Promise<void> {
  const comment = await getComment(commentId)
  if (!comment) return

  const post = await getPostById(comment.postId)
  if (!post) return

  await Promise.all([
    kv.del(`comments:${commentId}`),
    kv.srem(`posts:${comment.postId}:comments`, commentId),
    kv.hset(`posts:${comment.postId}`, {
      commentCount: Math.max(0, post.commentCount - 1),
      updatedAt: Date.now(),
    }),
  ])
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const commentIds = await kv.smembers(`posts:${postId}:comments`) as string[]
  if (!commentIds.length) return []

  const comments = await Promise.all(commentIds.map(id => getComment(id)))
  return comments.filter((c): c is Comment => c !== null).sort((a, b) => a.createdAt - b.createdAt)
}

// ==================== FOLLOWERS ====================

export async function followUser(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) return

  await Promise.all([
    kv.sadd(`users:${followerId}:following`, followingId),
    kv.sadd(`users:${followingId}:followers`, followerId),
  ])
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  await Promise.all([
    kv.srem(`users:${followerId}:following`, followingId),
    kv.srem(`users:${followingId}:followers`, followerId),
  ])
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const result = await kv.sismember(`users:${followerId}:following`, followingId)
  return result === 1
}

export async function getFollowers(userId: string): Promise<User[]> {
  const followerIds = await kv.smembers(`users:${userId}:followers`) as string[]
  if (!followerIds.length) return []

  const followers = await Promise.all(followerIds.map(id => getUserById(id)))
  return followers.filter((u): u is User => u !== null)
}

export async function getFollowing(userId: string): Promise<User[]> {
  const followingIds = await kv.smembers(`users:${userId}:following`) as string[]
  if (!followingIds.length) return []

  const following = await Promise.all(followingIds.map(id => getUserById(id)))
  return following.filter((u): u is User => u !== null)
}

export async function getFollowerCount(userId: string): Promise<number> {
  const count = await kv.scard(`users:${userId}:followers`)
  return count || 0
}

export async function getFollowingCount(userId: string): Promise<number> {
  const count = await kv.scard(`users:${userId}:following`)
  return count || 0
}

// ==================== FEED ====================

export async function getUserFeed(userId: string, offset = 0, limit = 20): Promise<Post[]> {
  // Feed = posts de usuarios que sigue + propios posts
  const following = await kv.smembers(`users:${userId}:following`) as string[]
  const allFollowedUsers = [userId, ...following]

  const postIds = new Set<string>()

  for (const uid of allFollowedUsers) {
    const userPostIds = await kv.zrange(`user:${uid}:posts`, 0, -1, {
      rev: true,
    }) as string[]
    userPostIds.forEach(id => postIds.add(id))
  }

  // Convertir a array y ordenar por fecha
  const sortedPostIds = Array.from(postIds)
  const postsWithTimestamp = await Promise.all(
    sortedPostIds.map(async (id) => {
      const post = await getPostById(id)
      return post ? { id, timestamp: post.createdAt } : null
    })
  )

  const sorted = postsWithTimestamp
    .filter((p): p is any => p !== null)
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(offset, offset + limit)
    .map(p => p.id)

  const posts = await Promise.all(sorted.map(id => getPostById(id)))
  return posts.filter((p): p is Post => p !== null)
}

import { prisma } from './prisma'

/**
 * REPOSITORY PATTERN PARA POSTGRESQL CON PRISMA
 * Mantiene la misma interfaz que la versión anterior de Vercel KV
 * para facilitar la migración con cambios mínimos en el código de consumo
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

export interface Message {
  id: string
  senderId: string
  receiverId: string
  text: string
  createdAt: number
  isRead: boolean
}

// ==================== UTILIDADES ====================

/**
 * Convierte User de Prisma a User de aplicación (timestamps como números)
 */
function prismaUserToAppUser(user: any): User {
  return {
    id: user.id,
    email: user.email,
    username: user.username,
    password: user.password,
    fullName: user.fullName,
    bio: user.bio,
    profileImage: user.profileImage || undefined,
    createdAt: user.createdAt.getTime(),
    updatedAt: user.updatedAt.getTime(),
    isPrivate: user.isPrivate,
  }
}

/**
 * Convierte Post de Prisma a Post de aplicación
 */
async function prismaPostToAppPost(post: any): Promise<Post> {
  const likeCount = await prisma.like.count({ where: { postId: post.id } })
  const commentCount = await prisma.comment.count({ where: { postId: post.id } })

  return {
    id: post.id,
    userId: post.userId,
    caption: post.caption,
    image: post.image,
    createdAt: post.createdAt.getTime(),
    updatedAt: post.updatedAt.getTime(),
    likeCount,
    commentCount,
  }
}

/**
 * Convierte Comment de Prisma a Comment de aplicación
 */
function prismaCommentToAppComment(comment: any): Comment {
  return {
    id: comment.id,
    postId: comment.postId,
    userId: comment.userId,
    text: comment.text,
    createdAt: comment.createdAt.getTime(),
  }
}

/**
 * Convierte Message de Prisma a Message de aplicación
 */
function prismaMessageToAppMessage(message: any): Message {
  return {
    id: message.id,
    senderId: message.senderId,
    receiverId: message.receiverId,
    text: message.text,
    createdAt: message.createdAt.getTime(),
    isRead: message.isRead,
  }
}


// ==================== USUARIOS ====================

export async function createUser(user: User): Promise<void> {
  await prisma.user.create({
    data: {
      id: user.id,
      email: user.email,
      username: user.username,
      password: user.password,
      fullName: user.fullName,
      bio: user.bio,
      profileImage: user.profileImage,
      isPrivate: user.isPrivate,
    },
  })
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  return user ? prismaUserToAppUser(user) : null
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
  return user ? prismaUserToAppUser(user) : null
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { username: username.toLowerCase() },
  })
  return user ? prismaUserToAppUser(user) : null
}

export async function getUserPassword(userId: string): Promise<string | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { password: true },
  })
  return user ? user.password : null
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const data: any = { ...updates }
  delete data.password // No actualizar contraseña aquí
  delete data.id // No actualizar ID

  await prisma.user.update({
    where: { id: userId },
    data,
  })
}

export async function searchUsers(query: string, limit = 20): Promise<User[]> {
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { username: { startsWith: query.toLowerCase(), mode: 'insensitive' } },
        { fullName: { contains: query, mode: 'insensitive' } },
      ],
    },
    take: limit,
  })
  return users.map(prismaUserToAppUser)
}


// ==================== POSTS ====================

export async function createPost(post: Post): Promise<void> {
  await prisma.post.create({
    data: {
      id: post.id,
      userId: post.userId,
      caption: post.caption,
      image: post.image,
    },
  })
}

export async function getPostById(postId: string): Promise<Post | null> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  })
  return post ? await prismaPostToAppPost(post) : null
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<void> {
  const data: any = { ...updates }
  delete data.id // No actualizar ID
  delete data.likeCount // Estos se calculan
  delete data.commentCount

  await prisma.post.update({
    where: { id: postId },
    data,
  })
}

export async function deletePost(postId: string): Promise<void> {
  // Prisma cascade delete maneja comentarios y likes automáticamente
  await prisma.post.delete({
    where: { id: postId },
  })
}

export async function getUserPosts(userId: string, offset = 0, limit = 10): Promise<Post[]> {
  const posts = await prisma.post.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  })
  return Promise.all(posts.map(prismaPostToAppPost))
}

export async function getGlobalPosts(offset = 0, limit = 20): Promise<Post[]> {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  })
  return Promise.all(posts.map(prismaPostToAppPost))
}


// ==================== LIKES ====================

export async function likePost(postId: string, userId: string): Promise<void> {
  await prisma.like.create({
    data: {
      postId,
      userId,
    },
  })
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  await prisma.like.deleteMany({
    where: {
      postId,
      userId,
    },
  })
}

export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const like = await prisma.like.findUnique({
    where: {
      postId_userId: {
        postId,
        userId,
      },
    },
  })
  return !!like
}

export async function getPostLikes(postId: string): Promise<string[]> {
  const likes = await prisma.like.findMany({
    where: { postId },
    select: { userId: true },
  })
  return likes.map((l: { userId: string }) => l.userId)
}


// ==================== COMENTARIOS ====================

export async function createComment(comment: Comment): Promise<void> {
  await prisma.comment.create({
    data: {
      id: comment.id,
      postId: comment.postId,
      userId: comment.userId,
      text: comment.text,
    },
  })
}

export async function getComment(commentId: string): Promise<Comment | null> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
  })
  return comment ? prismaCommentToAppComment(comment) : null
}

export async function deleteComment(commentId: string): Promise<void> {
  await prisma.comment.delete({
    where: { id: commentId },
  })
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' },
  })
  return comments.map(prismaCommentToAppComment)
}


// ==================== FOLLOWERS ====================

export async function followUser(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) return

  await prisma.user.update({
    where: { id: followerId },
    data: {
      following: {
        connect: { id: followingId },
      },
    },
  })
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  await prisma.user.update({
    where: { id: followerId },
    data: {
      following: {
        disconnect: { id: followingId },
      },
    },
  })
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: followerId },
    select: {
      following: {
        where: { id: followingId },
      },
    },
  })
  return user ? user.following.length > 0 : false
}

export async function getFollowers(userId: string): Promise<User[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      followers: true,
    },
  })
  return user ? user.followers.map(prismaUserToAppUser) : []
}

export async function getFollowing(userId: string): Promise<User[]> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      following: true,
    },
  })
  return user ? user.following.map(prismaUserToAppUser) : []
}

export async function getFollowerCount(userId: string): Promise<number> {
  return prisma.user.count({
    where: {
      following: {
        some: { id: userId },
      },
    },
  })
}

export async function getFollowingCount(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      following: { select: { id: true } },
    },
  })
  return user ? user.following.length : 0
}


// ==================== FEED ====================

export async function getUserFeed(userId: string, offset = 0, limit = 20): Promise<Post[]> {
  // Feed = posts de usuarios que sigue + propios posts
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      following: { select: { id: true } },
    },
  })

  if (!user) return []

  const followingIds = user.following.map((u: { id: string }) => u.id)
  const allFollowedUsers = [userId, ...followingIds]

  const posts = await prisma.post.findMany({
    where: {
      userId: {
        in: allFollowedUsers,
      },
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  })

  return Promise.all(posts.map(prismaPostToAppPost))
}


// ==================== MENSAJES PRIVADOS ====================

export async function createMessage(message: Message): Promise<void> {
  await prisma.message.create({
    data: {
      id: message.id,
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      createdAt: new Date(message.createdAt),
      isRead: message.isRead,
    },
  })
}

export async function getMessage(messageId: string): Promise<Message | null> {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  })
  return message ? prismaMessageToAppMessage(message) : null
}

export async function getConversation(
  userId1: string,
  userId2: string,
  offset = 0,
  limit = 50
): Promise<Message[]> {
  const messages = await prisma.message.findMany({
    where: {
      OR: [
        { senderId: userId1, receiverId: userId2 },
        { senderId: userId2, receiverId: userId1 },
      ],
    },
    orderBy: { createdAt: 'asc' },
    skip: offset,
    take: limit,
  })
  return messages.map(prismaMessageToAppMessage)
}

export async function getUserMessages(userId: string, offset = 0, limit = 50): Promise<Message[]> {
  const messages = await prisma.message.findMany({
    where: {
      receiverId: userId,
    },
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
  })
  return messages.map(prismaMessageToAppMessage)
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  await prisma.message.update({
    where: { id: messageId },
    data: { isRead: true },
  })
}

export async function getUnreadMessageCount(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      receiverId: userId,
      isRead: false,
    },
  })
}

export async function deleteMessage(messageId: string): Promise<void> {
  await prisma.message.delete({
    where: { id: messageId },
  })
}

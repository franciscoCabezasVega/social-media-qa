import fs from 'fs/promises'
import path from 'path'

/**
 * REPOSITORIO BASADO EN JSON PARA DESARROLLO LOCAL
 * Almacena datos temporales en archivos JSON
 */

const DATA_DIR = path.join(process.cwd(), '.dev-data')

// Tipos
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

// Base de datos en memoria
interface Database {
  users: Record<string, User & { followers: string[]; following: string[] }>
  posts: Record<string, Post>
  comments: Record<string, Comment>
  postLikes: Record<string, string[]> // postId -> userIds
  emailIndex: Record<string, string> // email -> userId
  usernameIndex: Record<string, string> // username -> userId
  userPosts: Record<string, string[]> // userId -> postIds
  postComments: Record<string, string[]> // postId -> commentIds
  counters: { users: number; posts: number; comments: number }
}

let db: Database = {
  users: {},
  posts: {},
  comments: {},
  postLikes: {},
  emailIndex: {},
  usernameIndex: {},
  userPosts: {},
  postComments: {},
  counters: { users: 0, posts: 0, comments: 0 },
}

// Inicializar directorio
async function ensureDataDir() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true })
  } catch (error) {
    console.error('Error creating data directory:', error)
  }
}

// Cargar datos de archivo
async function loadDatabase() {
  try {
    await ensureDataDir()
    const filePath = path.join(DATA_DIR, 'db.json')
    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false)

    if (exists) {
      const content = await fs.readFile(filePath, 'utf-8')
      db = JSON.parse(content)
    }
  } catch (error) {
    console.error('Error loading database:', error)
  }
}

// Guardar datos a archivo
async function saveDatabase() {
  try {
    await ensureDataDir()
    const filePath = path.join(DATA_DIR, 'db.json')
    await fs.writeFile(filePath, JSON.stringify(db, null, 2))
  } catch (error) {
    console.error('Error saving database:', error)
  }
}

// Cargar al iniciar
loadDatabase()

// ==================== COUNTERS ====================

export async function getNextId(type: 'user' | 'post' | 'comment'): Promise<number> {
  const key = `${type}s` as keyof typeof db.counters
  db.counters[key]++
  await saveDatabase()
  return db.counters[key]
}

// ==================== USUARIOS ====================

export async function createUser(user: User): Promise<void> {
  db.users[user.id] = {
    ...user,
    followers: [],
    following: [],
  }
  db.emailIndex[user.email.toLowerCase()] = user.id
  db.usernameIndex[user.username.toLowerCase()] = user.id
  db.userPosts[user.id] = []
  await saveDatabase()
}

export async function getUserById(userId: string): Promise<User | null> {
  const user = db.users[userId]
  if (!user) return null
  const { followers, following, ...userData } = user
  return userData as User
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const userId = db.emailIndex[email.toLowerCase()]
  if (!userId) return null
  return getUserById(userId)
}

export async function getUserByUsername(username: string): Promise<User | null> {
  const userId = db.usernameIndex[username.toLowerCase()]
  if (!userId) return null
  return getUserById(userId)
}

export async function getUserPassword(userId: string): Promise<string | null> {
  const user = db.users[userId]
  return user?.password || null
}

export async function updateUser(userId: string, updates: Partial<User>): Promise<void> {
  const user = db.users[userId]
  if (!user) return

  Object.assign(user, updates, {
    updatedAt: Date.now(),
  })
  await saveDatabase()
}

export async function searchUsers(query: string, limit = 20): Promise<User[]> {
  const username = query.toLowerCase()
  const userId = db.usernameIndex[username]
  if (!userId) return []
  const user = await getUserById(userId)
  return user ? [user] : []
}

// ==================== POST ====================

export async function createPost(post: Post): Promise<void> {
  db.posts[post.id] = post
  db.userPosts[post.userId] = db.userPosts[post.userId] || []
  db.userPosts[post.userId].push(post.id)
  db.postLikes[post.id] = []
  db.postComments[post.id] = []
  await saveDatabase()
}

export async function getPostById(postId: string): Promise<Post | null> {
  return db.posts[postId] || null
}

export async function updatePost(postId: string, updates: Partial<Post>): Promise<void> {
  const post = db.posts[postId]
  if (!post) return

  Object.assign(post, updates, {
    updatedAt: Date.now(),
  })
  await saveDatabase()
}

export async function deletePost(postId: string): Promise<void> {
  const post = db.posts[postId]
  if (!post) return

  delete db.posts[postId]
  delete db.postLikes[postId]
  delete db.postComments[postId]

  db.userPosts[post.userId] = (db.userPosts[post.userId] || []).filter(id => id !== postId)
  await saveDatabase()
}

export async function getUserPosts(userId: string, offset = 0, limit = 10): Promise<Post[]> {
  const postIds = (db.userPosts[userId] || []).sort((a, b) => {
    const postA = db.posts[a]
    const postB = db.posts[b]
    return (postB?.createdAt || 0) - (postA?.createdAt || 0)
  })

  return postIds
    .slice(offset, offset + limit)
    .map(id => db.posts[id])
    .filter((p): p is Post => p !== null)
}

export async function getGlobalPosts(offset = 0, limit = 20): Promise<Post[]> {
  const posts = Object.values(db.posts).sort((a, b) => b.createdAt - a.createdAt)
  return posts.slice(offset, offset + limit)
}

// ==================== LIKES ====================

export async function likePost(postId: string, userId: string): Promise<void> {
  const post = db.posts[postId]
  if (!post) return

  const likes = db.postLikes[postId] || []
  if (!likes.includes(userId)) {
    likes.push(userId)
    db.postLikes[postId] = likes
    post.likeCount++
    await saveDatabase()
  }
}

export async function unlikePost(postId: string, userId: string): Promise<void> {
  const post = db.posts[postId]
  if (!post) return

  const likes = db.postLikes[postId] || []
  const index = likes.indexOf(userId)
  if (index !== -1) {
    likes.splice(index, 1)
    db.postLikes[postId] = likes
    post.likeCount = Math.max(0, post.likeCount - 1)
    await saveDatabase()
  }
}

export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const likes = db.postLikes[postId] || []
  return likes.includes(userId)
}

export async function getPostLikes(postId: string): Promise<string[]> {
  return db.postLikes[postId] || []
}

// ==================== COMENTARIOS ====================

export async function createComment(comment: Comment): Promise<void> {
  db.comments[comment.id] = comment
  const postComments = db.postComments[comment.postId] || []
  postComments.push(comment.id)
  db.postComments[comment.postId] = postComments

  const post = db.posts[comment.postId]
  if (post) {
    post.commentCount++
  }
  await saveDatabase()
}

export async function getComment(commentId: string): Promise<Comment | null> {
  return db.comments[commentId] || null
}

export async function deleteComment(commentId: string): Promise<void> {
  const comment = db.comments[commentId]
  if (!comment) return

  delete db.comments[commentId]

  const postComments = db.postComments[comment.postId] || []
  db.postComments[comment.postId] = postComments.filter(id => id !== commentId)

  const post = db.posts[comment.postId]
  if (post) {
    post.commentCount = Math.max(0, post.commentCount - 1)
  }
  await saveDatabase()
}

export async function getPostComments(postId: string): Promise<Comment[]> {
  const commentIds = db.postComments[postId] || []
  return commentIds
    .map(id => db.comments[id])
    .filter((c): c is Comment => c !== null)
    .sort((a, b) => a.createdAt - b.createdAt)
}

// ==================== FOLLOWERS ====================

export async function followUser(followerId: string, followingId: string): Promise<void> {
  if (followerId === followingId) return

  const follower = db.users[followerId]
  const followingUser = db.users[followingId]

  if (follower && followingUser) {
    if (!follower.following.includes(followingId)) {
      follower.following.push(followingId)
    }
    if (!followingUser.followers.includes(followerId)) {
      followingUser.followers.push(followerId)
    }
    await saveDatabase()
  }
}

export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const follower = db.users[followerId]
  const followingUser = db.users[followingId]

  if (follower && followingUser) {
    follower.following = follower.following.filter(id => id !== followingId)
    followingUser.followers = followingUser.followers.filter(id => id !== followerId)
    await saveDatabase()
  }
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const user = db.users[followerId]
  return user?.following.includes(followingId) || false
}

export async function getFollowers(userId: string): Promise<User[]> {
  const user = db.users[userId]
  if (!user) return []

  return (user.followers || [])
    .map(id => {
      const follower = db.users[id]
      if (!follower) return null
      const { followers, following, ...userData } = follower
      return userData as User
    })
    .filter((u): u is User => u !== null)
}

export async function getFollowing(userId: string): Promise<User[]> {
  const user = db.users[userId]
  if (!user) return []

  return (user.following || [])
    .map(id => {
      const following = db.users[id]
      if (!following) return null
      const { followers, following: _, ...userData } = following
      return userData as User
    })
    .filter((u): u is User => u !== null)
}

export async function getFollowerCount(userId: string): Promise<number> {
  const user = db.users[userId]
  return user?.followers.length || 0
}

export async function getFollowingCount(userId: string): Promise<number> {
  const user = db.users[userId]
  return user?.following.length || 0
}

// ==================== FEED ====================

export async function getUserFeed(userId: string, offset = 0, limit = 20): Promise<Post[]> {
  const user = db.users[userId]
  if (!user) return []

  const followingUsers = [userId, ...user.following]
  const allPosts: Post[] = []

  for (const uid of followingUsers) {
    const userPostIds = db.userPosts[uid] || []
    userPostIds.forEach(postId => {
      const post = db.posts[postId]
      if (post) allPosts.push(post)
    })
  }

  return allPosts
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(offset, offset + limit)
}

/**
 * FACTORY PARA SELECCIONAR REPOSITORIO
 * Usa JSON en desarrollo, Vercel KV en producción
 */

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

const useJsonDb = process.env.DB_MODE === 'development' || process.env.NODE_ENV === 'development'

// Exportar dinámicamente según el ambiente
let repository: any

if (useJsonDb) {
  // Desarrollo: JSON en archivos
  repository = require('./kv-json')
} else {
  // Producción: Vercel KV
  repository = require('./kv')
}

// Re-exportar todas las funciones
export const {
  // Counters
  getNextId,
  // Usuarios
  createUser,
  getUserById,
  getUserByEmail,
  getUserByUsername,
  getUserPassword,
  updateUser,
  searchUsers,
  // Posts
  createPost,
  getPostById,
  updatePost,
  deletePost,
  getUserPosts,
  getGlobalPosts,
  // Likes
  likePost,
  unlikePost,
  hasUserLikedPost,
  getPostLikes,
  // Comentarios
  createComment,
  getComment,
  deleteComment,
  getPostComments,
  // Followers
  followUser,
  unfollowUser,
  isFollowing,
  getFollowers,
  getFollowing,
  getFollowerCount,
  getFollowingCount,
  // Feed
  getUserFeed,
} = repository

console.log(`📦 Database mode: ${useJsonDb ? 'JSON (Development)' : 'Vercel KV (Production)'}`)

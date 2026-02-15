/**
 * DATABASE REPOSITORY
 * Usa PostgreSQL con Prisma en todos los ambientes
 * (anteriormente usaba JSON en desarrollo y Vercel KV en producción)
 */

// Re-exportar todas las funciones y tipos desde kv.ts (que ahora usa Prisma)
export {
  // Tipos
  type User,
  type Post,
  type Comment,
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
} from './kv'

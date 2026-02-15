import { z } from 'zod'

/**
 * VALIDACIONES CON ZOD
 */

// ==================== AUTH ====================

export const RegisterSchema = z.object({
  email: z.string().email('Email inválido'),
  username: z
    .string()
    .min(3, 'Username mínimo 3 caracteres')
    .max(30, 'Username máximo 30 caracteres')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username solo puede contener letras, números, guiones y punto'),
  password: z
    .string()
    .min(8, 'Contraseña mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Contraseña debe contener al menos una mayúscula')
    .regex(/[0-9]/, 'Contraseña debe contener al menos un número'),
  fullName: z
    .string()
    .min(2, 'Nombre completo mínimo 2 caracteres')
    .max(100, 'Nombre completo máximo 100 caracteres'),
})

export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Contraseña requerida'),
})

// ==================== USUARIO ====================

export const UpdateProfileSchema = z.object({
  fullName: z.string().min(2).max(100),
  bio: z.string().max(150, 'Bio máximo 150 caracteres').optional(),
  isPrivate: z.boolean().optional(),
})

// ==================== POSTS ====================

export const CreatePostSchema = z.object({
  caption: z
    .string()
    .min(0)
    .max(2200, 'Caption máximo 2200 caracteres'),
  image: z
    .string()
    .url('URL de imagen inválida'),
})

export const UpdatePostSchema = z.object({
  caption: z
    .string()
    .max(2200)
    .optional(),
})

// ==================== COMENTARIOS ====================

export const CreateCommentSchema = z.object({
  text: z
    .string()
    .min(1, 'Comentario no puede estar vacío')
    .max(500, 'Comentario máximo 500 caracteres'),
})

// Tipos inferidos de Zod
export type RegisterInput = z.infer<typeof RegisterSchema>
export type LoginInput = z.infer<typeof LoginSchema>
export type UpdateProfileInput = z.infer<typeof UpdateProfileSchema>
export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type UpdatePostInput = z.infer<typeof UpdatePostSchema>
export type CreateCommentInput = z.infer<typeof CreateCommentSchema>

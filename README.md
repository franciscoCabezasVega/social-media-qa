# Social Media QA

Una plataforma moderna de red social construida con **Next.js**, **TypeScript**, **PostgreSQL (Neon)**, **Prisma** y **Vercel Blob**. Totalmente optimizada para despliegue en Vercel.

## 🚀 Características

- ✅ Autenticación segura con JWT en cookies HTTP-only
- ✅ Registro y login de usuarios con bcrypt
- ✅ Crear, editar y eliminar posts
- ✅ Sistema de likes y comentarios
- ✅ Seguir/dejar de seguir usuarios
- ✅ Feed personalizado
- ✅ Exploración de posts
- ✅ Perfiles de usuario con foto personalizada
- ✅ Edición de perfil
- ✅ Upload de imágenes con Vercel Blob

## 🏗️ Stack Tecnológico

- **Frontend:** Next.js, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, TypeScript
- **Base de Datos:** PostgreSQL (Neon) + Prisma ORM
- **Almacenamiento:** Vercel Blob (para imágenes)
- **Autenticación:** JWT + bcrypt
- **Validación:** Zod
- **Hosting:** Vercel

## 📦 Instalación Local

```bash
# Clonar repositorio
git clone <repo-url>
cd social-media

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🚀 Despliegue en Vercel

### Requisitos previos

1. Cuenta en [Vercel](https://vercel.com)
2. Vercel CLI instalado o conectar repositorio directamente

### Pasos de despliegue

1. **Conectar repositorio a Vercel:**
   - Ve a [vercel.com](https://vercel.com)
   - Conecta tu repositorio GitHub
   - Vercel detectará automáticamente que es un proyecto Next.js

2. **Configurar variables de entorno:**
   
   En la configuración del proyecto en Vercel, añade estas variables:
   
   ```
   JWT_SECRET        → Generador: openssl rand -base64 32
   KV_URL            → De tu instancia de Vercel KV
   KV_REST_API_URL   → De tu instancia de Vercel KV
   KV_REST_API_TOKEN → De tu instancia de Vercel KV
   BLOB_READ_WRITE_TOKEN → De tu almacenamiento Vercel Blob
   ```

3. **Deploy automático:**
   
   Vercel desplegará automáticamente cada vez que hagas push a `main` (o la rama configurada)

## 📂 Estructura de Carpetas

```
app/
├── (auth)/              # Rutas de autenticación
│   ├── login/
│   └── signup/
├── (main)/              # Rutas principales (protegidas)
│   ├── feed/
│   ├── explore/
│   ├── profile/
│   └── post/
├── api/                 # API Routes
│   ├── auth/
│   ├── posts/
│   ├── users/
│   └── upload/
└── lib/                 # Utilidades y servicios
    ├── auth.ts          # Autenticación y JWT
    ├── db.ts            # Conexión a BD
    ├── kv.ts            # Repository para Vercel KV
    ├── blob.ts          # Servicio de Vercel Blob
    └── validate.ts      # Validación con Zod
```

## 🔐 Seguridad

- ✅ Contraseñas hasheadas con bcrypt
- ✅ JWT firmado con secreto seguro
- ✅ Cookies HTTP-only
- ✅ Validación de entrada con Zod
- ✅ CSRF protection
- ✅ No expone secretos en frontend

## 📝 Variables de Entorno

```env
# PostgreSQL via Neon
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Vercel Blob (para imágenes)
BLOB_READ_WRITE_TOKEN=vercel_blob_xxx...

# Autenticación
JWT_SECRET=<secreto-seguro-32-caracteres>

# Environment
NODE_ENV=production
```

## 🛠️ Scripts Disponibles

```bash
npm run dev         # Iniciar servidor de desarrollo
npm run build       # Compilar para producción
npm run start       # Iniciar servidor de producción
npm run lint        # Verificar código

# Prisma
npm run prisma:migrate   # Ejecutar migraciones
npm run prisma:push      # Sincronizar schema con BD
npm run prisma:generate  # Generar cliente Prisma
npm run prisma:studio    # Abrir Prisma Studio UI
npm run verify      # Lint + Build
```

## 📄 Licencia

MIT

## 👨‍💻 Autor

Creado con ❤️

/**
 * UTILIDADES GENERALES
 */

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diff = now.getTime() - date.getTime()

  // Segundos
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return 'hace unos segundos'

  // Minutos
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `hace ${minutes}m`

  // Horas
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours}h`

  // Días
  const days = Math.floor(hours / 24)
  if (days < 7) return `hace ${days}d`

  // Semanas
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `hace ${weeks}w`

  // Meses
  const months = Math.floor(days / 30)
  if (months < 12) return `hace ${months}mo`

  // Años
  const years = Math.floor(months / 12)
  return `hace ${years}a`
}

export function generateId(prefix: string, suffix: number): string {
  return `${prefix}_${suffix}`
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length) + '...'
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

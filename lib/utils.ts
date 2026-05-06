import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export const platformLabels: Record<string, string> = {
  instagram: 'אינסטגרם',
  facebook: 'פייסבוק',
  tiktok: 'טיקטוק',
  linkedin: 'לינקדאין',
  story: 'סטורי',
  reel: 'ריל',
}

export const statusLabels: Record<string, string> = {
  writing: 'כתיבה',
  design: 'עיצוב',
  sent_approval: 'ממתין לאישור',
  needs_changes: 'דרוש שינוי',
  approved: 'מאושר',
  scheduled: 'מתוזמן',
  published: 'פורסם',
}

export const contentTypeLabels: Record<string, string> = {
  post: 'פוסט',
  reel: 'ריל',
  story: 'סטורי',
  carousel: 'קרוסלה',
  video: 'וידאו',
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-'
  const d = new Date(date)
  return d.toLocaleString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

import { cn } from '@/lib/utils'

const statusConfig: Record<string, { label: string; className: string }> = {
  writing: { label: 'כתיבה', className: 'bg-gray-100 text-gray-700 border-gray-200' },
  design: { label: 'עיצוב', className: 'bg-blue-100 text-blue-700 border-blue-200' },
  sent_approval: { label: 'ממתין לאישור', className: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  needs_changes: { label: 'דרוש שינוי', className: 'bg-red-100 text-red-700 border-red-200' },
  approved: { label: 'מאושר', className: 'bg-green-100 text-green-700 border-green-200' },
  scheduled: { label: 'מתוזמן', className: 'bg-purple-100 text-purple-700 border-purple-200' },
  published: { label: 'פורסם', className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
}

interface StatusBadgeProps {
  status: string
  className?: string
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, className, size = 'md' }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700 border-gray-200' }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className,
        className,
      )}
    >
      {config.label}
    </span>
  )
}

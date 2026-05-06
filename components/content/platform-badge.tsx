import { cn } from '@/lib/utils'
import { Instagram, Facebook, Linkedin, Video, BookImage, Clapperboard } from 'lucide-react'

const platformConfig: Record<string, { label: string; className: string; icon: React.ElementType }> = {
  instagram: {
    label: 'אינסטגרם',
    className: 'bg-pink-100 text-pink-700 border-pink-200',
    icon: Instagram,
  },
  facebook: {
    label: 'פייסבוק',
    className: 'bg-blue-100 text-blue-700 border-blue-200',
    icon: Facebook,
  },
  tiktok: {
    label: 'טיקטוק',
    className: 'bg-gray-900 text-white border-gray-800',
    icon: Video,
  },
  linkedin: {
    label: 'לינקדאין',
    className: 'bg-sky-100 text-sky-700 border-sky-200',
    icon: Linkedin,
  },
  story: {
    label: 'סטורי',
    className: 'bg-orange-100 text-orange-700 border-orange-200',
    icon: BookImage,
  },
  reel: {
    label: 'ריל',
    className: 'bg-purple-100 text-purple-700 border-purple-200',
    icon: Clapperboard,
  },
}

interface PlatformBadgeProps {
  platform: string
  className?: string
  showLabel?: boolean
  size?: 'sm' | 'md'
}

export function PlatformBadge({
  platform,
  className,
  showLabel = true,
  size = 'md',
}: PlatformBadgeProps) {
  const config = platformConfig[platform] || {
    label: platform,
    className: 'bg-gray-100 text-gray-700 border-gray-200',
    icon: Video,
  }
  const Icon = config.icon

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border font-medium',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
        config.className,
        className,
      )}
    >
      <Icon size={size === 'sm' ? 10 : 12} />
      {showLabel && config.label}
    </span>
  )
}

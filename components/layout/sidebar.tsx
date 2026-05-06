'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Home,
  Users,
  Calendar,
  FileText,
  BarChart2,
  LogOut,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const navItems = [
  { href: '/', label: 'דשבורד', icon: Home },
  { href: '/clients', label: 'לקוחות', icon: Users },
  { href: '/calendar', label: 'לוח תוכן', icon: Calendar },
  { href: '/content', label: 'תוכן', icon: FileText },
  { href: '/reports', label: 'דוחות', icon: BarChart2 },
]

interface SidebarProps {
  user: { name: string; email: string; role: string }
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('התנתקת בהצלחה')
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="fixed inset-y-0 right-0 w-60 bg-white border-l border-gray-100 flex flex-col z-30 shadow-sm">
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-none">Social CMS</div>
            <div className="text-xs text-gray-400 mt-0.5">ניהול סושיאל</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50',
              )}
            >
              <Icon
                size={18}
                className={cn(
                  isActive ? 'text-brand-600' : 'text-gray-400',
                )}
              />
              {item.label}
              {isActive && (
                <div className="mr-auto w-1.5 h-1.5 rounded-full bg-brand-600" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-100 p-3">
        <div className="flex items-center gap-3 px-3 py-2 mb-1">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-brand-700">
              {user.name.charAt(0)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
            <div className="text-xs text-gray-400 truncate">{user.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
        >
          <LogOut size={16} />
          התנתק
        </button>
      </div>
    </aside>
  )
}

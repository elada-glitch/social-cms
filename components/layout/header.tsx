'use client'

import { Bell } from 'lucide-react'
import useSWR from 'swr'
import Link from 'next/link'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface HeaderProps {
  title: string
  user: { name: string; role: string }
}

export function Header({ title, user }: HeaderProps) {
  const { data } = useSWR('/api/notifications', fetcher, { refreshInterval: 30000 })
  const unreadCount = data?.unreadCount || 0

  const roleLabels: Record<string, string> = {
    admin: 'מנהל מערכת',
    manager: 'מנהל סושיאל',
    designer: 'מעצב',
  }

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-20">
      <h1 className="text-lg font-bold text-gray-900">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors">
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User */}
        <div className="flex items-center gap-2.5 pl-3 border-r border-gray-100 mr-1">
          <div className="text-left">
            <div className="text-sm font-medium text-gray-900">{user.name}</div>
            <div className="text-xs text-gray-400">{roleLabels[user.role] || user.role}</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{user.name.charAt(0)}</span>
          </div>
        </div>
      </div>
    </header>
  )
}

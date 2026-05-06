'use client'

import useSWR from 'swr'
import Link from 'next/link'
import {
  Users,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react'
import { StatusBadge } from '@/components/content/status-badge'
import { PlatformBadge } from '@/components/content/platform-badge'
import { formatDate } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

interface StatCardProps {
  icon: React.ElementType
  label: string
  value: number | string
  color: string
  href?: string
}

function StatCard({ icon: Icon, label, value, color, href }: StatCardProps) {
  const inner = (
    <div className={`stat-card hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        <div className="text-sm text-gray-500">{label}</div>
      </div>
    </div>
  )
  if (href) return <Link href={href}>{inner}</Link>
  return inner
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR('/api/dashboard', fetcher, { refreshInterval: 60000 })

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-64 bg-gray-100 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-xl" />
        </div>
      </div>
    )
  }

  const { stats, upcomingContent, recentContent, needsAttention } = data || {}

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">דשבורד</h1>
          <p className="text-sm text-gray-500 mt-0.5">ברוך הבא! הנה סיכום הפעילות</p>
        </div>
        <Link href="/content/new" className="btn-primary">
          <FileText size={16} />
          פוסט חדש
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}
          label="לקוחות פעילים"
          value={stats?.activeClients || 0}
          color="bg-brand-500"
          href="/clients"
        />
        <StatCard
          icon={FileText}
          label="תוכן החודש"
          value={stats?.contentThisMonth || 0}
          color="bg-blue-500"
          href="/content"
        />
        <StatCard
          icon={Clock}
          label="ממתינים לאישור"
          value={stats?.pendingApprovals || 0}
          color="bg-yellow-500"
          href="/content?status=sent_approval"
        />
        <StatCard
          icon={CheckCircle2}
          label="פורסמו החודש"
          value={stats?.publishedThisMonth || 0}
          color="bg-emerald-500"
          href="/content?status=published"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming content */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <TrendingUp size={18} className="text-brand-500" />
              תוכן קרוב (7 ימים)
            </h2>
            <Link href="/calendar" className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
              לוח תוכן
              <ArrowLeft size={14} className="rtl-flip" />
            </Link>
          </div>

          {upcomingContent?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-40" />
              <p>אין תוכן מתוכנן לשבוע הקרוב</p>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingContent?.map((item: {
                id: string
                platform: string
                status: string
                publishDate: string
                mainCopy?: string
                client: { businessName: string }
              }) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <PlatformBadge platform={item.platform} showLabel={false} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {item.client.businessName}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5">
                      {item.mainCopy?.substring(0, 60) || 'אין טקסט עדיין'}...
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <StatusBadge status={item.status} size="sm" />
                    <span className="text-xs text-gray-400">{formatDate(item.publishDate)}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-5">
          {/* Needs attention */}
          {needsAttention?.length > 0 && (
            <div className="card">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <AlertTriangle size={16} className="text-yellow-500" />
                דורשים תשומת לב
              </h2>
              <div className="space-y-2">
                {needsAttention.map((client: {
                  id: string
                  businessName: string
                  quota: number
                  completed: number
                }) => (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="block p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 truncate">
                        {client.businessName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {client.completed}/{client.quota}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-brand-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(100, (client.completed / client.quota) * 100)}%`,
                        }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Recent activity */}
          <div className="card">
            <h2 className="font-semibold text-gray-900 mb-3">פעילות אחרונה</h2>
            <div className="space-y-2">
              {recentContent?.slice(0, 6).map((item: {
                id: string
                platform: string
                status: string
                updatedAt: string
                client: { businessName: string }
              }) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <PlatformBadge platform={item.platform} showLabel={false} size="sm" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-gray-800 truncate">
                      {item.client.businessName}
                    </div>
                    <div className="text-xs text-gray-400">{formatDate(item.updatedAt)}</div>
                  </div>
                  <StatusBadge status={item.status} size="sm" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function Calendar({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}

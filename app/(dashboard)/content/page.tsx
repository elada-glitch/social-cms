'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { Search, Plus, FileText, Filter, Send } from 'lucide-react'
import { StatusBadge } from '@/components/content/status-badge'
import { PlatformBadge } from '@/components/content/platform-badge'
import { formatDate } from '@/lib/utils'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const STATUS_TABS = [
  { value: '', label: 'הכל' },
  { value: 'writing', label: 'כתיבה' },
  { value: 'design', label: 'עיצוב' },
  { value: 'sent_approval', label: 'ממתין לאישור' },
  { value: 'needs_changes', label: 'דרוש שינוי' },
  { value: 'approved', label: 'מאושר' },
  { value: 'scheduled', label: 'מתוזמן' },
  { value: 'published', label: 'פורסם' },
]

const PLATFORMS = ['', 'instagram', 'facebook', 'tiktok', 'linkedin', 'story', 'reel']
const PLATFORM_LABELS: Record<string, string> = {
  '': 'כל הפלטפורמות',
  instagram: 'אינסטגרם', facebook: 'פייסבוק', tiktok: 'טיקטוק',
  linkedin: 'לינקדאין', story: 'סטורי', reel: 'ריל',
}

interface ContentItem {
  id: string
  platform: string
  contentType: string | null
  status: string
  publishDate: string | null
  mainCopy: string | null
  client: { id: string; businessName: string }
  assignedTo: { name: string } | null
}

export default function ContentPage() {
  const [status, setStatus] = useState('')
  const [platform, setPlatform] = useState('')
  const [clientId, setClientId] = useState('')
  const [search, setSearch] = useState('')

  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (platform) params.set('platform', platform)
  if (clientId) params.set('clientId', clientId)

  const { data, isLoading } = useSWR(`/api/content?${params}`, fetcher, {
    keepPreviousData: true,
  })
  const { data: clientsData } = useSWR('/api/clients?active=true', fetcher)

  const items: ContentItem[] = data?.items || []
  const clients = clientsData?.clients || []

  const filtered = search
    ? items.filter(
        (item) =>
          item.client.businessName.includes(search) ||
          item.mainCopy?.includes(search),
      )
    : items

  const sendApproval = async (id: string, e: React.MouseEvent) => {
    e.preventDefault()
    const res = await fetch(`/api/content/${id}/approve`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      const url = data.approvalUrl
      navigator.clipboard.writeText(url)
      alert(`קישור אישור הועתק:\n${url}`)
    }
  }

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="page-header">
        <div>
          <h1 className="page-title">תוכן</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total || 0} פריטים</p>
        </div>
        <Link href="/content/new" className="btn-primary">
          <Plus size={16} />
          תוכן חדש
        </Link>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatus(tab.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
              status === tab.value
                ? 'bg-brand-600 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-brand-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="חיפוש..."
            className="input pr-9 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-gray-400" />
          <select
            className="input text-sm w-auto"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {PLATFORM_LABELS[p]}
              </option>
            ))}
          </select>
          <select
            className="input text-sm w-auto"
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          >
            <option value="">כל הלקוחות</option>
            {clients.map((c: { id: string; businessName: string }) => (
              <option key={c.id} value={c.id}>
                {c.businessName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Content list */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card text-center py-16 text-gray-400">
          <FileText size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">אין פריטי תוכן</p>
          <p className="text-sm mt-1">
            <Link href="/content/new" className="text-brand-600 hover:underline">
              צור פריט חדש
            </Link>
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">לקוח</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">פלטפורמה</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 hidden lg:table-cell">תוכן</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">סטטוס</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">תאריך</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-50 hover:bg-gray-50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <Link href={`/content/${item.id}`} className="text-sm font-medium text-gray-900 hover:text-brand-700">
                      {item.client.businessName}
                    </Link>
                    {item.assignedTo && (
                      <div className="text-xs text-gray-400">{item.assignedTo.name}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <PlatformBadge platform={item.platform} size="sm" />
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell max-w-xs">
                    <p className="text-sm text-gray-600 truncate">
                      {item.mainCopy?.substring(0, 70) || (
                        <span className="text-gray-300">אין טקסט עדיין</span>
                      )}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} size="sm" />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                    {formatDate(item.publishDate)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Link
                        href={`/content/${item.id}`}
                        className="p-1.5 text-gray-400 hover:text-brand-600 hover:bg-brand-50 rounded"
                        title="ערוך"
                      >
                        <FileText size={14} />
                      </Link>
                      {item.status === 'design' && (
                        <button
                          onClick={(e) => sendApproval(item.id, e)}
                          className="p-1.5 text-gray-400 hover:text-yellow-600 hover:bg-yellow-50 rounded"
                          title="שלח לאישור"
                        >
                          <Send size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

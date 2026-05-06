'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { ChevronRight, ChevronLeft, Plus, Calendar } from 'lucide-react'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns'
import { he } from 'date-fns/locale'
import { PlatformBadge } from '@/components/content/platform-badge'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PLATFORM_COLORS: Record<string, string> = {
  instagram: 'bg-pink-100 text-pink-700 border-pink-200',
  facebook: 'bg-blue-100 text-blue-700 border-blue-200',
  tiktok: 'bg-gray-900 text-white border-gray-800',
  linkedin: 'bg-sky-100 text-sky-700 border-sky-200',
  story: 'bg-orange-100 text-orange-700 border-orange-200',
  reel: 'bg-purple-100 text-purple-700 border-purple-200',
}

const DAYS_HE = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת']

interface ContentItem {
  id: string
  platform: string
  status: string
  publishDate: string
  mainCopy: string | null
  client: { id: string; businessName: string }
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedClient, setSelectedClient] = useState('')

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })

  const params = new URLSearchParams({
    dateFrom: monthStart.toISOString(),
    dateTo: monthEnd.toISOString(),
    take: '200',
  })
  if (selectedClient) params.set('clientId', selectedClient)

  const { data } = useSWR(`/api/content?${params}`, fetcher, { keepPreviousData: true })
  const { data: clientsData } = useSWR('/api/clients?active=true', fetcher)

  const items: ContentItem[] = data?.items || []
  const clients = clientsData?.clients || []

  const days = eachDayOfInterval({ start: calStart, end: calEnd })

  const getItemsForDay = (day: Date) =>
    items.filter((item) => item.publishDate && isSameDay(new Date(item.publishDate), day))

  // Upcoming items
  const upcoming = items
    .filter((item) => new Date(item.publishDate) >= new Date())
    .sort((a, b) => new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime())
    .slice(0, 10)

  return (
    <div className="flex gap-5 h-[calc(100vh-64px-48px)] -m-6 overflow-hidden">
      {/* Calendar */}
      <div className="flex-1 flex flex-col p-6 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setCurrentDate((d) => subMonths(d, 1))}
              className="btn-ghost p-2"
            >
              <ChevronRight size={18} />
            </button>
            <h2 className="text-lg font-bold text-gray-900">
              {format(currentDate, 'MMMM yyyy', { locale: he })}
            </h2>
            <button
              onClick={() => setCurrentDate((d) => addMonths(d, 1))}
              className="btn-ghost p-2"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="btn-secondary text-sm"
            >
              היום
            </button>
          </div>

          <div className="flex items-center gap-3">
            <select
              className="input text-sm w-auto"
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
            >
              <option value="">כל הלקוחות</option>
              {clients.map((c: { id: string; businessName: string }) => (
                <option key={c.id} value={c.id}>
                  {c.businessName}
                </option>
              ))}
            </select>
            <Link href="/content/new" className="btn-primary text-sm">
              <Plus size={14} />
              פוסט חדש
            </Link>
          </div>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 mb-1">
          {DAYS_HE.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-xs font-semibold text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 flex-1 gap-px bg-gray-200 rounded-xl overflow-hidden">
          {days.map((day) => {
            const dayItems = getItemsForDay(day)
            const isToday = isSameDay(day, new Date())
            const isCurrentMonth = isSameMonth(day, currentDate)

            return (
              <div
                key={day.toISOString()}
                className={`bg-white p-1.5 flex flex-col min-h-24 ${
                  !isCurrentMonth ? 'bg-gray-50' : ''
                }`}
              >
                <div
                  className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                    isToday
                      ? 'bg-brand-600 text-white'
                      : isCurrentMonth
                      ? 'text-gray-700'
                      : 'text-gray-300'
                  }`}
                >
                  {format(day, 'd')}
                </div>
                <div className="flex flex-col gap-0.5 flex-1 overflow-hidden">
                  {dayItems.slice(0, 3).map((item) => (
                    <Link
                      key={item.id}
                      href={`/content/${item.id}`}
                      className={`text-xs px-1.5 py-0.5 rounded border truncate block hover:opacity-80 transition-opacity ${
                        PLATFORM_COLORS[item.platform] || 'bg-gray-100 text-gray-700 border-gray-200'
                      }`}
                      title={item.client.businessName}
                    >
                      {item.client.businessName}
                    </Link>
                  ))}
                  {dayItems.length > 3 && (
                    <span className="text-xs text-gray-400 px-1">
                      +{dayItems.length - 3} עוד
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Sidebar - upcoming */}
      <div className="w-72 bg-white border-r border-gray-100 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={16} className="text-brand-500" />
            תוכן קרוב
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {upcoming.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <p className="text-sm">אין תוכן מתוכנן</p>
            </div>
          ) : (
            upcoming.map((item) => (
              <Link
                key={item.id}
                href={`/content/${item.id}`}
                className="block p-3 bg-gray-50 rounded-xl hover:bg-brand-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <PlatformBadge platform={item.platform} size="sm" />
                  <span className="text-xs text-gray-400">
                    {format(new Date(item.publishDate), 'dd/MM', { locale: he })}
                  </span>
                </div>
                <div className="text-xs font-medium text-gray-800 truncate">
                  {item.client.businessName}
                </div>
                <div className="text-xs text-gray-500 truncate mt-0.5">
                  {item.mainCopy?.substring(0, 50) || 'אין טקסט'}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

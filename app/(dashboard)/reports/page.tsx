'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { BarChart2, TrendingUp, Heart, MessageSquare, Share2, Eye, MousePointer, Bookmark } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { he } from 'date-fns/locale'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const MONTHS = [
  { value: 1, label: 'ינואר' }, { value: 2, label: 'פברואר' },
  { value: 3, label: 'מרץ' }, { value: 4, label: 'אפריל' },
  { value: 5, label: 'מאי' }, { value: 6, label: 'יוני' },
  { value: 7, label: 'יולי' }, { value: 8, label: 'אוגוסט' },
  { value: 9, label: 'ספטמבר' }, { value: 10, label: 'אוקטובר' },
  { value: 11, label: 'נובמבר' }, { value: 12, label: 'דצמבר' },
]

interface ContentItem {
  id: string
  status: string
  platform: string
  reach?: number
  impressions?: number
  likes?: number
  comments?: number
  shares?: number
  saves?: number
  clicks?: number
  mainCopy?: string
  publishedAt?: string
}

export default function ReportsPage() {
  const now = new Date()
  const [selectedClientId, setSelectedClientId] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [metrics, setMetrics] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [reportSummary, setReportSummary] = useState('')

  const { data: clientsData } = useSWR('/api/clients?active=true', fetcher)
  const clients = clientsData?.clients || []

  const monthStart = startOfMonth(new Date(selectedYear, selectedMonth - 1, 1))
  const monthEnd = endOfMonth(new Date(selectedYear, selectedMonth - 1, 1))

  const contentParams = new URLSearchParams({
    clientId: selectedClientId,
    dateFrom: monthStart.toISOString(),
    dateTo: monthEnd.toISOString(),
    take: '100',
  })

  const { data: contentData } = useSWR(
    selectedClientId ? `/api/content?${contentParams}` : null,
    fetcher,
  )

  const items: ContentItem[] = contentData?.items || []
  const published = items.filter((i) => i.status === 'published')
  const selectedClient = clients.find((c: { id: string }) => c.id === selectedClientId)

  // Aggregate metrics
  const totals = published.reduce(
    (acc, item) => ({
      reach: acc.reach + (item.reach || 0),
      impressions: acc.impressions + (item.impressions || 0),
      likes: acc.likes + (item.likes || 0),
      comments: acc.comments + (item.comments || 0),
      shares: acc.shares + (item.shares || 0),
      saves: acc.saves + (item.saves || 0),
      clicks: acc.clicks + (item.clicks || 0),
    }),
    { reach: 0, impressions: 0, likes: 0, comments: 0, shares: 0, saves: 0, clicks: 0 },
  )

  // Platform breakdown
  const byPlatform = items.reduce(
    (acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const handleSaveReport = async () => {
    if (!selectedClientId) {
      toast.error('אנא בחר לקוח')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: selectedClientId,
          month: selectedMonth,
          year: selectedYear,
          totalPosts: published.length,
          totalReach: totals.reach,
          totalLikes: totals.likes,
          totalComments: totals.comments,
          summary: reportSummary,
        }),
      })
      if (!res.ok) throw new Error()
      toast.success('דוח נשמר בהצלחה')
    } catch {
      toast.error('שגיאה בשמירת הדוח')
    } finally {
      setSaving(false)
    }
  }

  const StatBox = ({
    icon: Icon,
    label,
    value,
    color,
  }: {
    icon: React.ElementType
    label: string
    value: number
    color: string
  }) => (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
        <Icon size={18} className="text-white" />
      </div>
      <div>
        <div className="text-xl font-bold text-gray-900">{value.toLocaleString('he-IL')}</div>
        <div className="text-xs text-gray-500">{label}</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl">
      <div className="page-header">
        <div>
          <h1 className="page-title">דוחות</h1>
          <p className="text-sm text-gray-500">סיכום חודשי לפי לקוח</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card space-y-4">
        <h2 className="font-semibold text-gray-900">בחר פרמטרים</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">לקוח</label>
            <select
              className="input"
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
            >
              <option value="">-- בחר לקוח --</option>
              {clients.map((c: { id: string; businessName: string }) => (
                <option key={c.id} value={c.id}>
                  {c.businessName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">חודש</label>
            <select
              className="input"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">שנה</label>
            <select
              className="input"
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {selectedClientId && (
        <>
          {/* Report header */}
          <div className="bg-gradient-to-l from-brand-600 to-brand-800 rounded-2xl p-6 text-white">
            <h2 className="text-xl font-bold mb-1">
              דוח חודשי - {selectedClient?.businessName}
            </h2>
            <p className="text-brand-200 text-sm">
              {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
            </p>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{items.length}</div>
                <div className="text-xs text-brand-200">פוסטים שנוצרו</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">{published.length}</div>
                <div className="text-xs text-brand-200">פורסמו</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl font-bold">
                  {selectedClient?.monthlyQuota
                    ? `${Math.round((published.length / selectedClient.monthlyQuota) * 100)}%`
                    : '-'}
                </div>
                <div className="text-xs text-brand-200">מילוי קוטה</div>
              </div>
            </div>
          </div>

          {/* Metrics */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">מדדי ביצועים</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatBox icon={Eye} label="הגעה כוללת" value={totals.reach} color="bg-blue-500" />
              <StatBox icon={TrendingUp} label="חשיפות" value={totals.impressions} color="bg-indigo-500" />
              <StatBox icon={Heart} label="לייקים" value={totals.likes} color="bg-pink-500" />
              <StatBox icon={MessageSquare} label="תגובות" value={totals.comments} color="bg-orange-500" />
              <StatBox icon={Share2} label="שיתופים" value={totals.shares} color="bg-green-500" />
              <StatBox icon={Bookmark} label="שמירות" value={totals.saves} color="bg-purple-500" />
              <StatBox icon={MousePointer} label="קליקים" value={totals.clicks} color="bg-teal-500" />
              <div className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3 shadow-sm">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-yellow-500">
                  <BarChart2 size={18} className="text-white" />
                </div>
                <div>
                  <div className="text-xl font-bold text-gray-900">
                    {totals.likes > 0 && totals.reach > 0
                      ? `${((totals.likes / totals.reach) * 100).toFixed(1)}%`
                      : '-'}
                  </div>
                  <div className="text-xs text-gray-500">שיעור מעורבות</div>
                </div>
              </div>
            </div>
          </div>

          {/* Platform breakdown */}
          {Object.keys(byPlatform).length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">פירוט לפי פלטפורמה</h3>
              <div className="space-y-2">
                {Object.entries(byPlatform).map(([platform, count]) => (
                  <div key={platform} className="flex items-center gap-3">
                    <div className="w-24 text-sm text-gray-600 capitalize">{platform}</div>
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-brand-500 h-2 rounded-full"
                        style={{ width: `${(count / items.length) * 100}%` }}
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-900 w-8 text-left">{count}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Content list */}
          {published.length > 0 && (
            <div className="card">
              <h3 className="font-semibold text-gray-900 mb-3">פוסטים שפורסמו</h3>
              <div className="space-y-2">
                {published.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 line-clamp-2">
                        {item.mainCopy || 'אין טקסט'}
                      </p>
                      <div className="flex gap-4 mt-2 text-xs text-gray-500">
                        {item.reach ? <span>הגעה: {item.reach.toLocaleString()}</span> : null}
                        {item.likes ? <span>לייקים: {item.likes.toLocaleString()}</span> : null}
                        {item.comments ? <span>תגובות: {item.comments.toLocaleString()}</span> : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary & Save */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-gray-900">סיכום הדוח</h3>
            <textarea
              className="textarea"
              rows={4}
              placeholder="כתוב סיכום חודשי לדוח..."
              value={reportSummary}
              onChange={(e) => setReportSummary(e.target.value)}
            />
            <button
              onClick={handleSaveReport}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'שומר...' : 'שמור דוח'}
            </button>
          </div>
        </>
      )}

      {!selectedClientId && (
        <div className="card text-center py-16 text-gray-400">
          <BarChart2 size={40} className="mx-auto mb-3 opacity-40" />
          <p className="font-medium">בחר לקוח וחודש לצפייה בדוח</p>
        </div>
      )}
    </div>
  )
}

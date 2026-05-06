'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import useSWR from 'swr'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PLATFORMS = ['instagram', 'facebook', 'tiktok', 'linkedin', 'story', 'reel']
const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'אינסטגרם', facebook: 'פייסבוק', tiktok: 'טיקטוק',
  linkedin: 'לינקדאין', story: 'סטורי', reel: 'ריל',
}
const CONTENT_TYPES = ['post', 'reel', 'story', 'carousel', 'video']
const CONTENT_TYPE_LABELS: Record<string, string> = {
  post: 'פוסט', reel: 'ריל', story: 'סטורי', carousel: 'קרוסלה', video: 'וידאו',
}

function NewContentForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const preClientId = searchParams.get('clientId') || ''

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    clientId: preClientId,
    platform: 'instagram',
    contentType: 'post',
    publishDate: '',
    mainCopy: '',
  })

  const { data: clientsData } = useSWR('/api/clients?active=true', fetcher)
  const clients = clientsData?.clients || []

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clientId) {
      toast.error('אנא בחר לקוח')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('פריט תוכן נוצר!')
      router.push(`/content/${data.item.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Link href="/content" className="btn-ghost p-2">
          <ArrowRight size={18} className="rtl-flip" />
        </Link>
        <div>
          <h1 className="page-title">תוכן חדש</h1>
          <p className="text-sm text-gray-500">צור פריט תוכן חדש</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-5">
        {/* Client */}
        <div>
          <label className="label">לקוח *</label>
          <select
            className="input"
            value={form.clientId}
            onChange={(e) => update('clientId', e.target.value)}
            required
          >
            <option value="">-- בחר לקוח --</option>
            {clients.map((c: { id: string; businessName: string }) => (
              <option key={c.id} value={c.id}>
                {c.businessName}
              </option>
            ))}
          </select>
        </div>

        {/* Platform */}
        <div>
          <label className="label">פלטפורמה *</label>
          <div className="flex flex-wrap gap-2">
            {PLATFORMS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => update('platform', p)}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                  form.platform === p
                    ? 'bg-brand-600 text-white border-brand-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                }`}
              >
                {PLATFORM_LABELS[p]}
              </button>
            ))}
          </div>
        </div>

        {/* Content type */}
        <div>
          <label className="label">סוג תוכן</label>
          <div className="flex flex-wrap gap-2">
            {CONTENT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => update('contentType', t)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                  form.contentType === t
                    ? 'bg-gray-900 text-white border-gray-900'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                }`}
              >
                {CONTENT_TYPE_LABELS[t]}
              </button>
            ))}
          </div>
        </div>

        {/* Publish date */}
        <div>
          <label className="label">תאריך פרסום</label>
          <input
            type="date"
            className="input"
            value={form.publishDate}
            onChange={(e) => update('publishDate', e.target.value)}
            dir="ltr"
          />
        </div>

        {/* Main copy */}
        <div>
          <label className="label">תוכן ראשוני (אופציונלי)</label>
          <textarea
            className="textarea"
            rows={4}
            placeholder="כתוב את הטקסט הראשוני כאן, או השאר ריק ועבד על זה בעורך..."
            value={form.mainCopy}
            onChange={(e) => update('mainCopy', e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Link href="/content" className="btn-secondary flex-1 justify-center">
            ביטול
          </Link>
          <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
            {loading ? 'יוצר...' : 'צור ועבור לעורך'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default function NewContentPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-64 bg-gray-100 rounded-xl" />}>
      <NewContentForm />
    </Suspense>
  )
}

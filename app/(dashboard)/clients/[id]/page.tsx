'use client'

import { useState, use } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowRight, Save, Plus, ExternalLink, Building2,
  FileText, BarChart2, Link2, Star
} from 'lucide-react'
import { StatusBadge } from '@/components/content/status-badge'
import { PlatformBadge } from '@/components/content/platform-badge'
import { formatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const PLATFORMS = ['instagram', 'facebook', 'tiktok', 'linkedin', 'story', 'reel']
const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'אינסטגרם', facebook: 'פייסבוק', tiktok: 'טיקטוק',
  linkedin: 'לינקדאין', story: 'סטורי', reel: 'ריל',
}

type Tab = 'general' | 'brand' | 'content' | 'links' | 'reports'

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('general')
  const [saving, setSaving] = useState(false)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [form, setForm] = useState<Record<string, any> | null>(null)

  const { data, mutate } = useSWR(`/api/clients/${id}`, fetcher, {
    onSuccess: (d) => {
      if (!form && d.client) {
        const c = d.client
        setForm({
          ...c,
          activePlatforms: JSON.parse(c.activePlatforms || '[]'),
        })
      }
    },
  })

  const client = data?.client

  const update = (field: string, value: unknown) =>
    setForm((prev) => prev ? { ...prev, [field]: value } : prev)

  const togglePlatform = (p: string) => {
    const current = (form?.activePlatforms as string[]) || []
    update('activePlatforms', current.includes(p) ? current.filter((x) => x !== p) : [...current, p])
  }

  const handleSave = async () => {
    if (!form) return
    setSaving(true)
    try {
      const res = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error('שגיאה')
      await mutate()
      toast.success('הלקוח עודכן בהצלחה')
    } catch {
      toast.error('שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  if (!client || !form) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-100 rounded-xl w-64" />
        <div className="h-64 bg-gray-100 rounded-xl" />
      </div>
    )
  }

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'general', label: 'פרטים כלליים', icon: Building2 },
    { id: 'brand', label: 'פרופיל מותג', icon: Star },
    { id: 'content', label: 'תוכן', icon: FileText },
    { id: 'links', label: 'קישורים', icon: Link2 },
    { id: 'reports', label: 'דוחות', icon: BarChart2 },
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/clients" className="btn-ghost p-2">
            <ArrowRight size={18} className="rtl-flip" />
          </Link>
          <div>
            <h1 className="page-title">{client.businessName}</h1>
            <p className="text-sm text-gray-500">{client.industry || 'ללא תחום'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Link href={`/content/new?clientId=${id}`} className="btn-secondary">
            <Plus size={16} />
            תוכן חדש
          </Link>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={16} />
            {saving ? 'שומר...' : 'שמור שינויים'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      {activeTab === 'general' && (
        <div className="card space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">שם העסק</label>
              <input
                className="input"
                value={(form.businessName as string) || ''}
                onChange={(e) => update('businessName', e.target.value)}
              />
            </div>
            <div>
              <label className="label">תחום עיסוק</label>
              <input
                className="input"
                value={(form.industry as string) || ''}
                onChange={(e) => update('industry', e.target.value)}
              />
            </div>
            <div>
              <label className="label">חבילה חודשית</label>
              <input
                className="input"
                value={(form.monthlyPackage as string) || ''}
                onChange={(e) => update('monthlyPackage', e.target.value)}
              />
            </div>
            <div>
              <label className="label">קוטה חודשית</label>
              <input
                type="number"
                className="input"
                value={(form.monthlyQuota as number) || 0}
                onChange={(e) => update('monthlyQuota', parseInt(e.target.value))}
              />
            </div>
            <div>
              <label className="label">סטטוס</label>
              <select
                className="input"
                value={(form.isActive as boolean) ? 'active' : 'inactive'}
                onChange={(e) => update('isActive', e.target.value === 'active')}
              >
                <option value="active">פעיל</option>
                <option value="inactive">לא פעיל</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">פלטפורמות פעילות</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    (form.activePlatforms as string[]).includes(p)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          <h3 className="font-medium text-gray-900 pt-2">פרטי קשר</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">איש קשר</label>
              <input
                className="input"
                value={(form.contactPerson as string) || ''}
                onChange={(e) => update('contactPerson', e.target.value)}
              />
            </div>
            <div>
              <label className="label">אימייל</label>
              <input
                type="email"
                className="input"
                dir="ltr"
                value={(form.contactEmail as string) || ''}
                onChange={(e) => update('contactEmail', e.target.value)}
              />
            </div>
            <div>
              <label className="label">טלפון</label>
              <input
                className="input"
                dir="ltr"
                value={(form.contactPhone as string) || ''}
                onChange={(e) => update('contactPhone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="label">הערות פנימיות</label>
            <textarea
              className="textarea"
              rows={3}
              value={(form.notes as string) || ''}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
        </div>
      )}

      {activeTab === 'brand' && (
        <div className="card space-y-4">
          <div>
            <label className="label">סגנון דיבור ומיתוג (Tone of Voice)</label>
            <textarea
              className="textarea"
              rows={4}
              value={(form.brandToneOfVoice as string) || ''}
              onChange={(e) => update('brandToneOfVoice', e.target.value)}
              placeholder="תאר את הטון, האופי והאישיות של המותג..."
            />
          </div>
          <div>
            <label className="label">קהל יעד</label>
            <textarea
              className="textarea"
              rows={3}
              value={(form.targetAudience as string) || ''}
              onChange={(e) => update('targetAudience', e.target.value)}
              placeholder="גיל, מין, עניינים, מאפיינים דמוגרפיים..."
            />
          </div>
          <div>
            <label className="label">שירותים / מוצרים</label>
            <textarea
              className="textarea"
              rows={3}
              value={(form.services as string) || ''}
              onChange={(e) => update('services', e.target.value)}
              placeholder="רשימת השירותים והמוצרים..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">מילים / נושאים אסורים</label>
              <textarea
                className="textarea"
                rows={3}
                value={(form.forbiddenWords as string) || ''}
                onChange={(e) => update('forbiddenWords', e.target.value)}
              />
            </div>
            <div>
              <label className="label">CTA מועדפים</label>
              <textarea
                className="textarea"
                rows={3}
                value={(form.preferredCTAs as string) || ''}
                onChange={(e) => update('preferredCTAs', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'content' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">פריטי תוכן</h3>
            <Link href={`/content/new?clientId=${id}`} className="btn-primary">
              <Plus size={16} /> תוכן חדש
            </Link>
          </div>
          {client.contentItems?.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <FileText size={32} className="mx-auto mb-2 opacity-40" />
              <p>אין פריטי תוכן עדיין</p>
            </div>
          ) : (
            <div className="space-y-2">
              {client.contentItems?.map((item: {
                id: string
                platform: string
                contentType: string | null
                status: string
                publishDate: string | null
                mainCopy: string | null
                assignedTo: { name: string } | null
              }) => (
                <Link
                  key={item.id}
                  href={`/content/${item.id}`}
                  className="card-sm flex items-center gap-3 hover:shadow-md transition-shadow"
                >
                  <PlatformBadge platform={item.platform} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 truncate">
                      {item.mainCopy?.substring(0, 80) || 'אין טקסט'}
                    </p>
                    {item.assignedTo && (
                      <p className="text-xs text-gray-400 mt-0.5">{item.assignedTo.name}</p>
                    )}
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
      )}

      {activeTab === 'links' && (
        <div className="card space-y-4">
          <div>
            <label className="label">Google Drive</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                dir="ltr"
                value={(form.googleDriveLink as string) || ''}
                onChange={(e) => update('googleDriveLink', e.target.value)}
                placeholder="https://drive.google.com/..."
              />
              {!!form.googleDriveLink && (
                <a
                  href={String(form.googleDriveLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
          <div>
            <label className="label">תיקיית Canva</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                dir="ltr"
                value={(form.canvaFolderLink as string) || ''}
                onChange={(e) => update('canvaFolderLink', e.target.value)}
                placeholder="https://www.canva.com/..."
              />
              {!!form.canvaFolderLink && (
                <a
                  href={String(form.canvaFolderLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
          <div>
            <label className="label">תבניות Canva</label>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                dir="ltr"
                value={(form.canvaTemplateLink as string) || ''}
                onChange={(e) => update('canvaTemplateLink', e.target.value)}
                placeholder="https://www.canva.com/..."
              />
              {!!form.canvaTemplateLink && (
                <a
                  href={String(form.canvaTemplateLink)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  <ExternalLink size={16} />
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-4">
          {client.reports?.length === 0 ? (
            <div className="card text-center py-12 text-gray-400">
              <BarChart2 size={32} className="mx-auto mb-2 opacity-40" />
              <p>אין דוחות עדיין</p>
            </div>
          ) : (
            <div className="space-y-3">
              {client.reports?.map((report: {
                id: string
                month: number
                year: number
                totalPosts: number
                totalReach: number
                totalLikes: number
                summary: string | null
              }) => (
                <div key={report.id} className="card">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-gray-900">
                      {report.month}/{report.year}
                    </h3>
                    <Link
                      href={`/reports?clientId=${id}&month=${report.month}&year=${report.year}`}
                      className="text-sm text-brand-600 hover:text-brand-700"
                    >
                      צפה בדוח
                    </Link>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{report.totalPosts}</div>
                      <div className="text-xs text-gray-500">פוסטים</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{report.totalReach?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">הגעה</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold text-gray-900">{report.totalLikes?.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">לייקים</div>
                    </div>
                  </div>
                  {report.summary && (
                    <p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">
                      {report.summary}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

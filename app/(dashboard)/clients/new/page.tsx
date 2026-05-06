'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Save } from 'lucide-react'
import toast from 'react-hot-toast'

const PLATFORMS = ['instagram', 'facebook', 'tiktok', 'linkedin', 'story', 'reel']
const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'אינסטגרם',
  facebook: 'פייסבוק',
  tiktok: 'טיקטוק',
  linkedin: 'לינקדאין',
  story: 'סטורי',
  reel: 'ריל',
}

export default function NewClientPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    businessName: '',
    industry: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    activePlatforms: [] as string[],
    monthlyPackage: '',
    monthlyQuota: '',
    googleDriveLink: '',
    canvaFolderLink: '',
    canvaTemplateLink: '',
    brandToneOfVoice: '',
    targetAudience: '',
    services: '',
    forbiddenWords: '',
    preferredCTAs: '',
    notes: '',
  })

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const togglePlatform = (p: string) => {
    setForm((prev) => ({
      ...prev,
      activePlatforms: prev.activePlatforms.includes(p)
        ? prev.activePlatforms.filter((x) => x !== p)
        : [...prev.activePlatforms, p],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('הלקוח נוצר בהצלחה!')
      router.push(`/clients/${data.client.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה ביצירת הלקוח')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
      <div className="flex items-center gap-3">
        <Link href="/clients" className="btn-ghost p-2">
          <ArrowRight size={18} className="rtl-flip" />
        </Link>
        <div>
          <h1 className="page-title">לקוח חדש</h1>
          <p className="text-sm text-gray-500">הוסף לקוח חדש למערכת</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* General info */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 text-base">פרטים כלליים</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">שם העסק *</label>
              <input
                className="input"
                value={form.businessName}
                onChange={(e) => update('businessName', e.target.value)}
                required
                placeholder="שם העסק"
              />
            </div>
            <div>
              <label className="label">תחום עיסוק</label>
              <input
                className="input"
                value={form.industry}
                onChange={(e) => update('industry', e.target.value)}
                placeholder="מסעדנות, יופי, נדל&quot;ן..."
              />
            </div>
            <div>
              <label className="label">חבילה חודשית</label>
              <input
                className="input"
                value={form.monthlyPackage}
                onChange={(e) => update('monthlyPackage', e.target.value)}
                placeholder="בסיסי, פרימיום, VIP..."
              />
            </div>
            <div>
              <label className="label">קוטה חודשית (פוסטים)</label>
              <input
                type="number"
                className="input"
                value={form.monthlyQuota}
                onChange={(e) => update('monthlyQuota', e.target.value)}
                placeholder="12"
                min="0"
              />
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="label">פלטפורמות פעילות</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-all ${
                    form.activePlatforms.includes(p)
                      ? 'bg-brand-600 text-white border-brand-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-brand-300'
                  }`}
                >
                  {PLATFORM_LABELS[p]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 text-base">פרטי קשר</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">איש קשר</label>
              <input
                className="input"
                value={form.contactPerson}
                onChange={(e) => update('contactPerson', e.target.value)}
                placeholder="שם מלא"
              />
            </div>
            <div>
              <label className="label">אימייל</label>
              <input
                type="email"
                className="input"
                value={form.contactEmail}
                onChange={(e) => update('contactEmail', e.target.value)}
                placeholder="email@domain.co.il"
                dir="ltr"
              />
            </div>
            <div>
              <label className="label">טלפון</label>
              <input
                className="input"
                value={form.contactPhone}
                onChange={(e) => update('contactPhone', e.target.value)}
                placeholder="050-0000000"
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Brand profile */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 text-base">פרופיל מותג</h2>

          <div>
            <label className="label">סגנון דיבור ומיתוג</label>
            <textarea
              className="textarea"
              rows={3}
              value={form.brandToneOfVoice}
              onChange={(e) => update('brandToneOfVoice', e.target.value)}
              placeholder="תאר את הטון, האופי והאישיות של המותג..."
            />
          </div>
          <div>
            <label className="label">קהל יעד</label>
            <textarea
              className="textarea"
              rows={2}
              value={form.targetAudience}
              onChange={(e) => update('targetAudience', e.target.value)}
              placeholder="מי הלקוחות? גיל, מין, עניינים, מאפיינים..."
            />
          </div>
          <div>
            <label className="label">שירותים / מוצרים</label>
            <textarea
              className="textarea"
              rows={2}
              value={form.services}
              onChange={(e) => update('services', e.target.value)}
              placeholder="רשימת השירותים והמוצרים העיקריים..."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">מילים / נושאים אסורים</label>
              <textarea
                className="textarea"
                rows={2}
                value={form.forbiddenWords}
                onChange={(e) => update('forbiddenWords', e.target.value)}
                placeholder="מילים שלא לכלול בתוכן..."
              />
            </div>
            <div>
              <label className="label">CTA מועדפים</label>
              <textarea
                className="textarea"
                rows={2}
                value={form.preferredCTAs}
                onChange={(e) => update('preferredCTAs', e.target.value)}
                placeholder="קראו לפעולה מועדפים..."
              />
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 text-base">קישורים</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Google Drive</label>
              <input
                className="input"
                value={form.googleDriveLink}
                onChange={(e) => update('googleDriveLink', e.target.value)}
                placeholder="https://drive.google.com/..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="label">תיקיית Canva</label>
              <input
                className="input"
                value={form.canvaFolderLink}
                onChange={(e) => update('canvaFolderLink', e.target.value)}
                placeholder="https://www.canva.com/..."
                dir="ltr"
              />
            </div>
            <div>
              <label className="label">תבניות Canva</label>
              <input
                className="input"
                value={form.canvaTemplateLink}
                onChange={(e) => update('canvaTemplateLink', e.target.value)}
                placeholder="https://www.canva.com/..."
                dir="ltr"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="card space-y-4">
          <h2 className="font-semibold text-gray-900 text-base">הערות פנימיות</h2>
          <textarea
            className="textarea"
            rows={3}
            value={form.notes}
            onChange={(e) => update('notes', e.target.value)}
            placeholder="הערות, מידע נוסף על הלקוח..."
          />
        </div>

        <div className="flex gap-3 justify-end">
          <Link href="/clients" className="btn-secondary">
            ביטול
          </Link>
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? 'שומר...' : (
              <>
                <Save size={16} />
                שמור לקוח
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

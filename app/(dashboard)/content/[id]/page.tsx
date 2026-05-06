'use client'

import { useState, use, useRef } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import {
  ArrowRight, Save, Send, CheckCircle, Calendar, Copy,
  Sparkles, Clock, RefreshCw, ExternalLink, ChevronDown
} from 'lucide-react'
import { StatusBadge } from '@/components/content/status-badge'
import { PlatformBadge } from '@/components/content/platform-badge'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type ContentTab = 'texts' | 'video' | 'notes' | 'links' | 'metrics'
type AIAction =
  | 'generate_ideas' | 'write_caption' | 'improve_copy' | 'make_shorter'
  | 'make_sales' | 'make_emotional' | 'reel_script' | 'linkedin_version'
  | 'instagram_version' | 'hashtags' | 'create_cta' | 'fix_hebrew'
  | 'design_brief' | 'content_plan' | 'hook' | 'first_comment'

const AI_ACTIONS: { action: AIAction; label: string; emoji: string }[] = [
  { action: 'generate_ideas', label: 'רעיונות לפוסט', emoji: '💡' },
  { action: 'write_caption', label: 'כתוב קפשן', emoji: '✍️' },
  { action: 'improve_copy', label: 'שפר טקסט', emoji: '✨' },
  { action: 'make_shorter', label: 'קצר', emoji: '✂️' },
  { action: 'make_sales', label: 'יותר מכירתי', emoji: '💰' },
  { action: 'make_emotional', label: 'יותר רגשי', emoji: '❤️' },
  { action: 'reel_script', label: 'תסריט ריל', emoji: '🎬' },
  { action: 'linkedin_version', label: 'גרסת לינקדאין', emoji: '💼' },
  { action: 'instagram_version', label: 'גרסת אינסטגרם', emoji: '📸' },
  { action: 'hashtags', label: 'האשטאגים', emoji: '#' },
  { action: 'create_cta', label: 'CTA', emoji: '📣' },
  { action: 'fix_hebrew', label: 'תקן עברית', emoji: '🔤' },
  { action: 'design_brief', label: 'בריף עיצוב', emoji: '🎨' },
  { action: 'content_plan', label: 'תוכנית חודשית', emoji: '📅' },
  { action: 'hook', label: 'הוק', emoji: '🎣' },
  { action: 'first_comment', label: 'תגובה ראשונה', emoji: '💬' },
]

const STATUS_ACTIONS: { label: string; status: string; className: string }[] = [
  { label: 'כתיבה', status: 'writing', className: 'bg-gray-100 text-gray-700 hover:bg-gray-200' },
  { label: 'עיצוב', status: 'design', className: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
  { label: 'מאושר', status: 'approved', className: 'bg-green-100 text-green-700 hover:bg-green-200' },
  { label: 'מתוזמן', status: 'scheduled', className: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
  { label: 'פורסם', status: 'published', className: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' },
]

export default function ContentEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [activeTab, setActiveTab] = useState<ContentTab>('texts')
  const [activeField, setActiveField] = useState<string>('mainCopy')
  const [aiLoading, setAiLoading] = useState(false)
  const [aiResult, setAiResult] = useState('')
  const [saving, setSaving] = useState(false)
  const [additionalInstruction, setAdditionalInstruction] = useState('')
  const [showStatusMenu, setShowStatusMenu] = useState(false)

  const fieldRefs = useRef<Record<string, HTMLTextAreaElement | null>>({})

  const { data, mutate } = useSWR(`/api/content/${id}`, fetcher)
  const { data: versionsData, mutate: mutateVersions } = useSWR(
    `/api/content/${id}/versions`,
    fetcher,
  )

  const [form, setForm] = useState<Record<string, string | number | null>>({})
  const item = data?.item

  // Initialize form when data loads
  if (item && Object.keys(form).length === 0) {
    setForm({
      mainCopy: item.mainCopy || '',
      hook: item.hook || '',
      caption: item.caption || '',
      cta: item.cta || '',
      hashtags: item.hashtags || '',
      firstComment: item.firstComment || '',
      storyText: item.storyText || '',
      reelScript: item.reelScript || '',
      videoShotList: item.videoShotList || '',
      notesForDesigner: item.notesForDesigner || '',
      notesForClient: item.notesForClient || '',
      internalNotes: item.internalNotes || '',
      canvaLink: item.canvaLink || '',
      googleDriveLink: item.googleDriveLink || '',
      reach: item.reach ?? '',
      impressions: item.impressions ?? '',
      likes: item.likes ?? '',
      comments: item.comments ?? '',
      shares: item.shares ?? '',
      saves: item.saves ?? '',
      clicks: item.clicks ?? '',
      publishDate: item.publishDate ? item.publishDate.split('T')[0] : '',
    })
  }

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form }),
      })
      if (!res.ok) throw new Error('שגיאה')
      await mutate()
      toast.success('נשמר בהצלחה')
    } catch {
      toast.error('שגיאה בשמירה')
    } finally {
      setSaving(false)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    setShowStatusMenu(false)
    setSaving(true)
    try {
      const res = await fetch(`/api/content/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) throw new Error()
      await mutate()
      toast.success('סטטוס עודכן')
    } catch {
      toast.error('שגיאה בעדכון סטטוס')
    } finally {
      setSaving(false)
    }
  }

  const handleSendApproval = async () => {
    // Save first
    await handleSave()
    const res = await fetch(`/api/content/${id}/approve`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) {
      await navigator.clipboard.writeText(data.approvalUrl)
      toast.success('קישור אישור הועתק ללוח!')
      await mutate()
    } else {
      toast.error('שגיאה ביצירת קישור אישור')
    }
  }

  const handleSchedule = async () => {
    const scheduledAt = item?.publishDate || new Date().toISOString()
    const res = await fetch(`/api/content/${id}/schedule`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ scheduledAt }),
    })
    if (res.ok) {
      toast.success('תוזמן לפרסום!')
      await mutate()
    }
  }

  const handleAIGenerate = async (action: AIAction) => {
    setAiLoading(true)
    setAiResult('')
    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          contentItemId: id,
          currentContent: form[activeField] as string || form.mainCopy as string || '',
          additionalInstruction,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setAiResult(data.result)
      await mutateVersions()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'שגיאה בבינה המלאכותית')
    } finally {
      setAiLoading(false)
    }
  }

  const copyToEditor = () => {
    if (!aiResult) return
    update(activeField, aiResult)
    toast.success(`הועתק לשדה "${activeField}"`)
  }

  if (!item) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-10 bg-gray-100 rounded-xl w-64" />
        <div className="h-[600px] bg-gray-100 rounded-xl" />
      </div>
    )
  }

  const TextArea = ({
    field,
    label,
    rows = 4,
    placeholder = '',
  }: {
    field: string
    label: string
    rows?: number
    placeholder?: string
  }) => (
    <div>
      <label
        className={`label flex items-center justify-between cursor-pointer ${activeField === field ? 'text-brand-700' : ''}`}
        onClick={() => setActiveField(field)}
      >
        <span>{label}</span>
        {activeField === field && (
          <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
            פעיל לAI
          </span>
        )}
      </label>
      <textarea
        ref={(el) => { fieldRefs.current[field] = el }}
        className={`textarea transition-all ${activeField === field ? 'ring-2 ring-brand-500 border-transparent' : ''}`}
        rows={rows}
        placeholder={placeholder}
        value={(form[field] as string) || ''}
        onChange={(e) => update(field, e.target.value)}
        onClick={() => setActiveField(field)}
      />
    </div>
  )

  return (
    <div className="flex flex-col h-[calc(100vh-64px-48px)] gap-0 animate-fadeIn -m-6">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/content" className="btn-ghost p-1.5">
            <ArrowRight size={17} className="rtl-flip" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900">{item.client.businessName}</span>
            <PlatformBadge platform={item.platform} size="sm" />
            {item.publishDate && (
              <span className="text-xs text-gray-400 flex items-center gap-1">
                <Calendar size={12} />
                {formatDateTime(item.publishDate)}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Status */}
          <div className="relative">
            <button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              className="flex items-center gap-1.5 btn-secondary text-sm"
            >
              <StatusBadge status={item.status} size="sm" />
              <ChevronDown size={14} />
            </button>
            {showStatusMenu && (
              <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 min-w-40">
                {STATUS_ACTIONS.map((s) => (
                  <button
                    key={s.status}
                    onClick={() => handleStatusChange(s.status)}
                    className="w-full text-right px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button onClick={handleSendApproval} className="btn-secondary text-sm">
            <Send size={14} />
            שלח לאישור
          </button>
          <button onClick={handleSchedule} className="btn-secondary text-sm">
            <Calendar size={14} />
            תזמן
          </button>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">
            <Save size={14} />
            {saving ? 'שומר...' : 'שמור'}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel - Content editor */}
        <div className="flex-1 flex flex-col overflow-hidden border-l border-gray-100">
          {/* Tabs */}
          <div className="flex gap-1 px-4 pt-3 pb-0 border-b border-gray-100 bg-white flex-shrink-0">
            {(
              [
                { id: 'texts', label: 'טקסטים' },
                { id: 'video', label: 'וידאו / ריל' },
                { id: 'notes', label: 'הערות' },
                { id: 'links', label: 'קישורים' },
                { id: 'metrics', label: 'מדדים' },
              ] as { id: ContentTab; label: string }[]
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-all -mb-px ${
                  activeTab === tab.id
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Editor content */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Publish date - always visible */}
            <div>
              <label className="label">תאריך פרסום</label>
              <input
                type="date"
                className="input max-w-xs"
                value={(form.publishDate as string) || ''}
                onChange={(e) => update('publishDate', e.target.value)}
                dir="ltr"
              />
            </div>

            {activeTab === 'texts' && (
              <div className="space-y-4">
                <TextArea
                  field="mainCopy"
                  label="טקסט ראשי"
                  rows={5}
                  placeholder="הטקסט הראשי של הפוסט..."
                />
                <TextArea field="hook" label="הוק (פותח)" rows={2} placeholder="שורה פותחת חזקה..." />
                <TextArea field="caption" label="קפשן מלא" rows={5} placeholder="הקפשן הסופי עם כל הטקסט..." />
                <TextArea field="cta" label="CTA" rows={2} placeholder="קריאה לפעולה..." />
                <TextArea field="hashtags" label="האשטאגים" rows={3} placeholder="#האשטאג1 #האשטאג2..." />
                <TextArea field="firstComment" label="תגובה ראשונה" rows={2} placeholder="תגובה ראשונה עם האשטאגים נוספים..." />
              </div>
            )}

            {activeTab === 'video' && (
              <div className="space-y-4">
                <TextArea
                  field="reelScript"
                  label="תסריט ריל / וידאו"
                  rows={8}
                  placeholder="שניות | מה רואים | מה שומעים&#10;0-3 | אינטרו | טקסט על המסך..."
                />
                <TextArea
                  field="videoShotList"
                  label="רשימת צילומים"
                  rows={5}
                  placeholder="תיאור כל צילום / סצנה..."
                />
                <TextArea field="storyText" label="טקסט לסטורי" rows={3} placeholder="טקסט לסטורי..." />
              </div>
            )}

            {activeTab === 'notes' && (
              <div className="space-y-4">
                <TextArea
                  field="notesForDesigner"
                  label="הערות למעצב"
                  rows={4}
                  placeholder="הנחיות עיצוב, צבעים, סגנון, אלמנטים..."
                />
                <TextArea
                  field="notesForClient"
                  label="הערות ללקוח"
                  rows={3}
                  placeholder="הסברים ללקוח על הפוסט..."
                />
                <TextArea
                  field="internalNotes"
                  label="הערות פנימיות"
                  rows={3}
                  placeholder="הערות לצוות (לא נשלח ללקוח)..."
                />
                {item.clientNotes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-1">
                      הערות מהלקוח
                    </h4>
                    <p className="text-sm text-yellow-700">{item.clientNotes}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'links' && (
              <div className="space-y-4">
                <div>
                  <label className="label">קישור Canva</label>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      dir="ltr"
                      placeholder="https://www.canva.com/design/..."
                      value={(form.canvaLink as string) || ''}
                      onChange={(e) => update('canvaLink', e.target.value)}
                    />
                    {form.canvaLink && (
                      <a
                        href={form.canvaLink as string}
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
                  <label className="label">קישור Google Drive</label>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1"
                      dir="ltr"
                      placeholder="https://drive.google.com/..."
                      value={(form.googleDriveLink as string) || ''}
                      onChange={(e) => update('googleDriveLink', e.target.value)}
                    />
                    {form.googleDriveLink && (
                      <a
                        href={form.googleDriveLink as string}
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

            {activeTab === 'metrics' && (
              <div className="space-y-4">
                <p className="text-sm text-gray-500">מדדי ביצועים לפוסט המפורסם</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {[
                    { field: 'reach', label: 'הגעה (Reach)' },
                    { field: 'impressions', label: 'חשיפות' },
                    { field: 'likes', label: 'לייקים' },
                    { field: 'comments', label: 'תגובות' },
                    { field: 'shares', label: 'שיתופים' },
                    { field: 'saves', label: 'שמירות' },
                    { field: 'clicks', label: 'קליקים' },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="label">{label}</label>
                      <input
                        type="number"
                        className="input"
                        min="0"
                        value={(form[field] as string) || ''}
                        onChange={(e) => update(field, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right panel - AI Assistant */}
        <div className="w-80 flex flex-col bg-white border-r border-gray-100 flex-shrink-0">
          {/* Client context */}
          <div className="px-4 py-3 border-b border-gray-100 bg-brand-50">
            <div className="text-xs font-semibold text-brand-800 mb-1 flex items-center gap-1">
              <Sparkles size={12} />
              עוזר AI - {item.client.businessName}
            </div>
            {item.client.brandToneOfVoice && (
              <p className="text-xs text-brand-600 truncate">{item.client.brandToneOfVoice}</p>
            )}
            <div className="mt-1.5">
              <div className="text-xs text-brand-600 font-medium">
                שדה פעיל: <span className="text-brand-800">{activeField}</span>
              </div>
            </div>
          </div>

          {/* AI Actions */}
          <div className="p-3 border-b border-gray-100 flex-shrink-0">
            <div className="grid grid-cols-2 gap-1.5">
              {AI_ACTIONS.map(({ action, label, emoji }) => (
                <button
                  key={action}
                  onClick={() => handleAIGenerate(action)}
                  disabled={aiLoading}
                  className="flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium bg-white border border-gray-200 rounded-lg hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 transition-all text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-right"
                >
                  <span className="text-sm">{emoji}</span>
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>

            <div className="mt-2">
              <input
                className="input text-xs"
                placeholder="הוראה נוספת לAI (אופציונלי)..."
                value={additionalInstruction}
                onChange={(e) => setAdditionalInstruction(e.target.value)}
              />
            </div>
          </div>

          {/* AI Result */}
          <div className="flex-1 flex flex-col overflow-hidden p-3">
            {aiLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
                  <p className="text-sm">מייצר תוכן...</p>
                </div>
              </div>
            ) : aiResult ? (
              <div className="flex-1 flex flex-col gap-2">
                <div className="flex-1 bg-gray-50 rounded-xl p-3 text-sm text-gray-800 overflow-y-auto leading-relaxed whitespace-pre-wrap font-['Assistant']">
                  {aiResult}
                </div>
                <button
                  onClick={copyToEditor}
                  className="btn-primary text-sm justify-center"
                >
                  <Copy size={14} />
                  העתק לעורך
                </button>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-gray-300">
                <div>
                  <Sparkles size={28} className="mx-auto mb-2 opacity-40" />
                  <p className="text-sm">לחץ על כפתור AI לייצור תוכן</p>
                  <p className="text-xs mt-1">התוצאה תופיע כאן</p>
                </div>
              </div>
            )}
          </div>

          {/* Version history */}
          {versionsData?.versions?.length > 0 && (
            <div className="border-t border-gray-100 p-3 flex-shrink-0 max-h-48 overflow-y-auto">
              <h4 className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <Clock size={11} />
                היסטוריית גרסאות
              </h4>
              <div className="space-y-1.5">
                {versionsData.versions.slice(0, 8).map((v: {
                  id: string
                  aiAction: string | null
                  field: string
                  value: string | null
                  createdAt: string
                }) => (
                  <button
                    key={v.id}
                    onClick={() => {
                      if (v.value) {
                        setAiResult(v.value)
                      }
                    }}
                    className="w-full text-right text-xs p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-medium text-gray-700 truncate">
                      {v.aiAction || v.field}
                    </div>
                    <div className="text-gray-400 truncate">{v.value?.substring(0, 40)}</div>
                    <div className="text-gray-300 mt-0.5">{formatDateTime(v.createdAt)}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, use, useEffect } from 'react'
import { CheckCircle, XCircle, ExternalLink, Calendar, Loader2, ThumbsUp, AlertCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'אינסטגרם', facebook: 'פייסבוק', tiktok: 'טיקטוק',
  linkedin: 'לינקדאין', story: 'סטורי', reel: 'ריל',
}

interface ApprovalData {
  link: {
    id: string
    status: string
    title: string | null
    respondedAt: string | null
    clientName: string | null
    client: {
      businessName: string
      contactPerson: string | null
    }
    contentItem: {
      id: string
      platform: string
      contentType: string | null
      publishDate: string | null
      mainCopy: string | null
      hook: string | null
      caption: string | null
      cta: string | null
      hashtags: string | null
      firstComment: string | null
      storyText: string | null
      reelScript: string | null
      notesForClient: string | null
      canvaLink: string | null
      googleDriveLink: string | null
    } | null
  }
}

type Stage = 'loading' | 'review' | 'submitting' | 'done' | 'error'

export default function ApprovalPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params)
  const [data, setData] = useState<ApprovalData | null>(null)
  const [stage, setStage] = useState<Stage>('loading')
  const [decision, setDecision] = useState<'approved' | 'needs_changes' | null>(null)
  const [comment, setComment] = useState('')
  const [clientName, setClientName] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    fetch(`/api/approval/${token}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) {
          setError(d.error)
          setStage('error')
        } else {
          setData(d)
          if (d.link.respondedAt) {
            setStage('done')
          } else {
            setStage('review')
          }
        }
      })
      .catch(() => {
        setError('שגיאה בטעינת הדף')
        setStage('error')
      })
  }, [token])

  const handleSubmit = async () => {
    if (!decision) return
    setStage('submitting')

    try {
      const res = await fetch(`/api/approval/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: decision,
          clientComment: comment,
          clientName,
        }),
      })

      if (!res.ok) throw new Error()
      setStage('done')
    } catch {
      setError('שגיאה בשליחת התגובה')
      setStage('review')
    }
  }

  const item = data?.link.contentItem

  if (stage === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <Loader2 size={32} className="animate-spin mx-auto mb-3" />
          <p>טוען תוכן...</p>
        </div>
      </div>
    )
  }

  if (stage === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
          <h1 className="text-xl font-bold text-gray-900 mb-2">קישור לא תקין</h1>
          <p className="text-gray-500">{error || 'הקישור שגוי או פג תוקפו'}</p>
        </div>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-200">
            <CheckCircle size={40} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">תודה!</h1>
          <p className="text-gray-600 text-lg">
            {data?.link.status === 'approved'
              ? 'אישרת את התוכן בהצלחה. הצוות שלנו יתחיל בעיצוב ופרסום.'
              : 'קיבלנו את ההערות שלך. הצוות שלנו יבצע את השינויים המבוקשים.'}
          </p>
          <div className="mt-6 p-4 bg-white rounded-xl border border-gray-100 shadow-sm text-sm text-gray-500">
            <strong className="text-gray-700">{data?.link.client.businessName}</strong>
            <br />
            ניצור איתך קשר בקרוב
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-gray-400 font-medium uppercase tracking-wide">Social CMS</div>
            <h1 className="text-lg font-bold text-gray-900">
              {data?.link.client.businessName}
            </h1>
          </div>
          {item?.platform && (
            <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
              {PLATFORM_LABELS[item.platform] || item.platform}
            </span>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {data?.link.title || 'בקשת אישור תוכן'}
          </h2>
          {item?.publishDate && (
            <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
              <Calendar size={14} />
              <span>תאריך פרסום מתוכנן: {formatDate(item.publishDate)}</span>
            </div>
          )}
        </div>

        {/* Content card */}
        {item && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Canva / Design links */}
            {(item.canvaLink || item.googleDriveLink) && (
              <div className="border-b border-gray-100 p-4 bg-brand-50 flex flex-wrap gap-3">
                {item.canvaLink && (
                  <a
                    href={item.canvaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-brand-200 text-brand-700 rounded-lg text-sm font-medium hover:bg-brand-50 transition-colors"
                  >
                    <ExternalLink size={15} />
                    צפה בעיצוב Canva
                  </a>
                )}
                {item.googleDriveLink && (
                  <a
                    href={item.googleDriveLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink size={15} />
                    Google Drive
                  </a>
                )}
              </div>
            )}

            <div className="p-6 space-y-5">
              {item.hook && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">פתיחה</h3>
                  <p className="text-gray-800 font-medium text-lg">{item.hook}</p>
                </div>
              )}

              {item.mainCopy && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">תוכן ראשי</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {item.mainCopy}
                  </div>
                </div>
              )}

              {item.caption && item.caption !== item.mainCopy && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">קפשן</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {item.caption}
                  </div>
                </div>
              )}

              {item.cta && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">קריאה לפעולה</h3>
                  <p className="text-gray-800 font-medium">{item.cta}</p>
                </div>
              )}

              {item.hashtags && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">האשטאגים</h3>
                  <p className="text-gray-500 text-sm" dir="ltr">{item.hashtags}</p>
                </div>
              )}

              {item.storyText && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">טקסט לסטורי</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-gray-800 leading-relaxed whitespace-pre-wrap">
                    {item.storyText}
                  </div>
                </div>
              )}

              {item.reelScript && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">תסריט ריל</h3>
                  <div className="bg-gray-50 rounded-xl p-4 text-gray-700 text-sm font-mono leading-relaxed whitespace-pre-wrap">
                    {item.reelScript}
                  </div>
                </div>
              )}

              {item.notesForClient && (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <h3 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">הערה מהצוות</h3>
                  <p className="text-blue-800 text-sm">{item.notesForClient}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Decision form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
          <h3 className="font-bold text-gray-900 text-lg">מה דעתך?</h3>

          {/* Name */}
          <div>
            <label className="label">שמך (אופציונלי)</label>
            <input
              className="input max-w-sm"
              placeholder={data?.link.client.contactPerson || 'שם מלא'}
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
            />
          </div>

          {/* Decision buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setDecision('approved')}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                decision === 'approved'
                  ? 'border-green-500 bg-green-50 shadow-md shadow-green-100'
                  : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
              }`}
            >
              <ThumbsUp
                size={32}
                className={decision === 'approved' ? 'text-green-600' : 'text-gray-400'}
              />
              <div>
                <div className={`font-bold text-lg ${decision === 'approved' ? 'text-green-700' : 'text-gray-600'}`}>
                  מאשר!
                </div>
                <div className="text-sm text-gray-400">התוכן נראה מצוין</div>
              </div>
            </button>

            <button
              onClick={() => setDecision('needs_changes')}
              className={`flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all ${
                decision === 'needs_changes'
                  ? 'border-orange-500 bg-orange-50 shadow-md shadow-orange-100'
                  : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              <XCircle
                size={32}
                className={decision === 'needs_changes' ? 'text-orange-600' : 'text-gray-400'}
              />
              <div>
                <div className={`font-bold text-lg ${decision === 'needs_changes' ? 'text-orange-700' : 'text-gray-600'}`}>
                  דרוש שינוי
                </div>
                <div className="text-sm text-gray-400">יש הערות לתיקון</div>
              </div>
            </button>
          </div>

          {/* Comment */}
          {decision === 'needs_changes' && (
            <div>
              <label className="label">מה לשנות?</label>
              <textarea
                className="textarea"
                rows={4}
                placeholder="פרט מה ברצונך לשנות בתוכן..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          )}

          {decision === 'approved' && (
            <div>
              <label className="label">הערה (אופציונלי)</label>
              <textarea
                className="textarea"
                rows={2}
                placeholder="תגובה חיובית? הוסף כאן..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!decision || stage === 'submitting'}
            className={`w-full py-4 rounded-xl font-bold text-base transition-all ${
              !decision
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : decision === 'approved'
                ? 'bg-green-600 text-white hover:bg-green-700 shadow-md shadow-green-200'
                : 'bg-orange-600 text-white hover:bg-orange-700 shadow-md shadow-orange-200'
            }`}
          >
            {stage === 'submitting' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" />
                שולח...
              </span>
            ) : decision === 'approved' ? (
              '✅ אשר תוכן'
            ) : decision === 'needs_changes' ? (
              '🔄 שלח הערות לשינוי'
            ) : (
              'בחר אפשרות למעלה'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

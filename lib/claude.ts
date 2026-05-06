import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export type AIAction =
  | 'generate_ideas' | 'write_caption' | 'improve_copy' | 'make_shorter'
  | 'make_sales' | 'make_emotional' | 'reel_script' | 'linkedin_version'
  | 'instagram_version' | 'hashtags' | 'create_cta' | 'fix_hebrew'
  | 'design_brief' | 'content_plan' | 'hook' | 'first_comment'

interface ClientBrandContext {
  businessName: string
  industry?: string | null
  brandToneOfVoice?: string | null
  targetAudience?: string | null
  services?: string | null
  forbiddenWords?: string | null
  preferredCTAs?: string | null
}

interface GenerateParams {
  action: AIAction
  clientContext: ClientBrandContext
  currentContent?: string
  platform?: string
  contentType?: string
  additionalInstruction?: string
  previousContent?: string[]
}

export async function generateContent(params: GenerateParams): Promise<string> {
  const systemPrompt = buildSystemPrompt(params.clientContext)
  const userPrompt = buildUserPrompt(params)

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  return (message.content[0] as { type: string; text: string }).text
}

function buildSystemPrompt(clientCtx: ClientBrandContext): string {
  return `אתה עוזר קופירייטינג מקצועי המתמחה בתוכן לרשתות חברתיות בעברית.
אתה עובד עבור סוכנות שיווק דיגיטלי ומסייע למנהל הסושיאל מדיה שלה.

פרטי הלקוח:
- שם העסק: ${clientCtx.businessName}
${clientCtx.industry ? `- תחום עיסוק: ${clientCtx.industry}` : ''}
${clientCtx.brandToneOfVoice ? `- סגנון דיבור ומיתוג: ${clientCtx.brandToneOfVoice}` : ''}
${clientCtx.targetAudience ? `- קהל יעד: ${clientCtx.targetAudience}` : ''}
${clientCtx.services ? `- שירותים/מוצרים: ${clientCtx.services}` : ''}
${clientCtx.forbiddenWords ? `- מילים/נושאים אסורים: ${clientCtx.forbiddenWords}` : ''}
${clientCtx.preferredCTAs ? `- CTA מועדפים: ${clientCtx.preferredCTAs}` : ''}

כללים:
- כתוב תמיד בעברית תקינה ושוטפת
- שמור על סגנון הדיבור של הלקוח
- אל תשתמש במילים/נושאים האסורים
- התאם לפלטפורמה המבוקשת
- תן רק את הטקסט המבוקש, ללא הסברים מיותרים`
}

function buildUserPrompt(params: GenerateParams): string {
  const actionPrompts: Record<AIAction, string> = {
    generate_ideas: `צור 5 רעיונות לפוסטים לפלטפורמת ${params.platform || 'אינסטגרם'}.
פורמט: כל רעיון בשורה נפרדת עם מספר, נושא קצר וזווית ייחודית.`,

    write_caption: `כתוב קפשן מושלם לפוסט בפלטפורמת ${params.platform || 'אינסטגרם'}.
${params.currentContent ? `בסיס הטקסט: "${params.currentContent}"` : ''}
כלול: הוק פותח, גוף, CTA, ואיפור עם מעברים.`,

    improve_copy: `שפר את הטקסט הבא, שמור על המסר אך שפר את הניסוח, הזרימה והאפקטיביות:
"${params.currentContent}"`,

    make_shorter: `קצר את הטקסט הבא לכמחצית, שמור על המסר העיקרי:
"${params.currentContent}"`,

    make_sales: `שכתב את הטקסט הבא בסגנון מכירתי יותר, עם דחיפות ו-CTA חזק:
"${params.currentContent}"`,

    make_emotional: `שכתב את הטקסט הבא בסגנון רגשי ומחבר יותר, שידבר ללב:
"${params.currentContent}"`,

    reel_script: `כתוב תסריט לריל של 30-60 שניות בנושא:
${params.currentContent || 'נושא כללי לעסק'}
פורמט: שניות | מה רואים | מה שומעים/טקסט`,

    linkedin_version: `כתוב גרסה ל-LinkedIn (מקצועי, ערכי, אסרטיבי) של:
"${params.currentContent}"`,

    instagram_version: `כתוב גרסה לאינסטגרם (ויזואלי, אנרגטי, עם אמוג'ים) של:
"${params.currentContent}"`,

    hashtags: `צור 15-20 האשטאגים רלוונטיים בעברית ואנגלית לפוסט:
"${params.currentContent}"
פורמט: #האשטאג`,

    create_cta: `צור 5 אפשרויות CTA שונות בסגנון ובעוצמה שונים לפוסט זה:
"${params.currentContent}"`,

    fix_hebrew: `תקן שגיאות עברית, ניקוד לא נכון, ומשפטים לא תקניים בטקסט:
"${params.currentContent}"
החזר רק את הטקסט המתוקן.`,

    design_brief: `צור בריף עיצוב מפורט למעצב עבור פוסט זה:
"${params.currentContent}"
כלול: סגנון ויזואלי, צבעים, טיפוגרפיה, אלמנטים, אווירה.`,

    content_plan: `צור תוכנית תוכן חודשית ל${params.platform || 'אינסטגרם'}.
כלול 12 פוסטים עם: תאריך, נושא, סוג תוכן, זווית.`,

    hook: `כתוב 5 הוקים שונים (פותחי פוסט) לפוסט בנושא:
"${params.currentContent}"
כל הוק בשורה נפרדת.`,

    first_comment: `כתוב תגובה ראשונה (first comment) עם האשטאגים ואמוג'ים לפוסט:
"${params.currentContent}"`,
  }

  return (
    actionPrompts[params.action] +
    (params.additionalInstruction ? `\n\nהוראות נוספות: ${params.additionalInstruction}` : '')
  )
}

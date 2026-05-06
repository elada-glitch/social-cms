import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { generateContent, AIAction } from '@/lib/claude'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { action, contentItemId, currentContent, additionalInstruction } = await request.json()

    if (!action || !contentItemId) {
      return NextResponse.json({ error: 'action ו-contentItemId הם שדות חובה' }, { status: 400 })
    }

    // Fetch content item with client context
    const item = await prisma.contentItem.findUnique({
      where: { id: contentItemId },
      include: { client: true },
    })

    if (!item) return NextResponse.json({ error: 'תוכן לא נמצא' }, { status: 404 })

    const result = await generateContent({
      action: action as AIAction,
      clientContext: {
        businessName: item.client.businessName,
        industry: item.client.industry,
        brandToneOfVoice: item.client.brandToneOfVoice,
        targetAudience: item.client.targetAudience,
        services: item.client.services,
        forbiddenWords: item.client.forbiddenWords,
        preferredCTAs: item.client.preferredCTAs,
      },
      currentContent: currentContent || item.mainCopy || '',
      platform: item.platform,
      contentType: item.contentType || undefined,
      additionalInstruction,
    })

    // Save version
    await prisma.contentVersion.create({
      data: {
        contentItemId,
        field: 'ai_generated',
        value: result,
        aiAction: action,
        aiPrompt: currentContent || item.mainCopy || '',
      },
    })

    return NextResponse.json({ result })
  } catch (error) {
    console.error('AI generate error:', error)
    return NextResponse.json({ error: 'שגיאה בהפעלת בינה מלאכותית' }, { status: 500 })
  }
}

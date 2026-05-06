import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        contentItems: {
          orderBy: { publishDate: 'desc' },
          take: 20,
          include: { assignedTo: { select: { name: true } } },
        },
        reports: { orderBy: [{ year: 'desc' }, { month: 'desc' }], take: 6 },
        _count: { select: { contentItems: true } },
      },
    })

    if (!client) return NextResponse.json({ error: 'לקוח לא נמצא' }, { status: 404 })
    return NextResponse.json({ client })
  } catch (error) {
    console.error('Client GET error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const data = await request.json()

    const client = await prisma.client.update({
      where: { id },
      data: {
        businessName: data.businessName,
        industry: data.industry,
        contactPerson: data.contactPerson,
        contactEmail: data.contactEmail,
        contactPhone: data.contactPhone,
        activePlatforms: Array.isArray(data.activePlatforms)
          ? JSON.stringify(data.activePlatforms)
          : data.activePlatforms,
        monthlyPackage: data.monthlyPackage,
        monthlyQuota: data.monthlyQuota ? parseInt(data.monthlyQuota) : 0,
        googleDriveLink: data.googleDriveLink,
        canvaFolderLink: data.canvaFolderLink,
        canvaTemplateLink: data.canvaTemplateLink,
        brandToneOfVoice: data.brandToneOfVoice,
        targetAudience: data.targetAudience,
        services: data.services,
        forbiddenWords: data.forbiddenWords,
        preferredCTAs: data.preferredCTAs,
        notes: data.notes,
        isActive: data.isActive,
      },
    })

    return NextResponse.json({ client })
  } catch (error) {
    console.error('Client PUT error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    await prisma.client.update({ where: { id }, data: { isActive: false } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Client DELETE error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

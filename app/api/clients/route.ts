import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const active = searchParams.get('active')

    const clients = await prisma.client.findMany({
      where: {
        isActive: active === 'false' ? false : active === 'true' ? true : undefined,
        businessName: search ? { contains: search } : undefined,
      },
      orderBy: { businessName: 'asc' },
      include: {
        _count: { select: { contentItems: true } },
      },
    })

    return NextResponse.json({ clients })
  } catch (error) {
    console.error('Clients GET error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await request.json()
    const {
      businessName,
      industry,
      contactPerson,
      contactEmail,
      contactPhone,
      activePlatforms,
      monthlyPackage,
      monthlyQuota,
      googleDriveLink,
      canvaFolderLink,
      canvaTemplateLink,
      brandToneOfVoice,
      targetAudience,
      services,
      forbiddenWords,
      preferredCTAs,
      notes,
    } = data

    if (!businessName) {
      return NextResponse.json({ error: 'שם העסק הוא שדה חובה' }, { status: 400 })
    }

    const client = await prisma.client.create({
      data: {
        businessName,
        industry,
        contactPerson,
        contactEmail,
        contactPhone,
        activePlatforms: JSON.stringify(activePlatforms || []),
        monthlyPackage,
        monthlyQuota: monthlyQuota ? parseInt(monthlyQuota) : 0,
        googleDriveLink,
        canvaFolderLink,
        canvaTemplateLink,
        brandToneOfVoice,
        targetAudience,
        services,
        forbiddenWords,
        preferredCTAs,
        notes,
      },
    })

    return NextResponse.json({ client }, { status: 201 })
  } catch (error) {
    console.error('Clients POST error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

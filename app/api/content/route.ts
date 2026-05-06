import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const platform = searchParams.get('platform')
    const status = searchParams.get('status')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const take = parseInt(searchParams.get('take') || '50')
    const skip = parseInt(searchParams.get('skip') || '0')

    const where: Record<string, unknown> = {}
    if (clientId) where.clientId = clientId
    if (platform) where.platform = platform
    if (status) where.status = status
    if (dateFrom || dateTo) {
      where.publishDate = {}
      if (dateFrom) (where.publishDate as Record<string, Date>).gte = new Date(dateFrom)
      if (dateTo) (where.publishDate as Record<string, Date>).lte = new Date(dateTo)
    }

    const [items, total] = await Promise.all([
      prisma.contentItem.findMany({
        where,
        orderBy: { publishDate: 'asc' },
        take,
        skip,
        include: {
          client: { select: { id: true, businessName: true } },
          assignedTo: { select: { id: true, name: true } },
        },
      }),
      prisma.contentItem.count({ where }),
    ])

    return NextResponse.json({ items, total })
  } catch (error) {
    console.error('Content GET error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await request.json()
    const { clientId, platform, contentType, publishDate, mainCopy, assignedToId } = data

    if (!clientId || !platform) {
      return NextResponse.json({ error: 'לקוח ופלטפורמה הם שדות חובה' }, { status: 400 })
    }

    const item = await prisma.contentItem.create({
      data: {
        clientId,
        platform,
        contentType,
        publishDate: publishDate ? new Date(publishDate) : null,
        mainCopy,
        assignedToId: assignedToId || session.userId,
        status: 'writing',
      },
      include: {
        client: { select: { id: true, businessName: true } },
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Content POST error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

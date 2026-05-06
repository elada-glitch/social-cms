import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get('clientId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const reports = await prisma.monthlyReport.findMany({
      where: {
        clientId: clientId || undefined,
        month: month ? parseInt(month) : undefined,
        year: year ? parseInt(year) : undefined,
      },
      include: { client: { select: { businessName: true } } },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    })

    return NextResponse.json({ reports })
  } catch (error) {
    console.error('Reports GET error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await request.json()
    const { clientId, month, year, totalPosts, totalReach, totalLikes, totalComments, topPost, summary } = data

    const report = await prisma.monthlyReport.upsert({
      where: { clientId_month_year: { clientId, month, year } },
      update: { totalPosts, totalReach, totalLikes, totalComments, topPost, summary },
      create: { clientId, month, year, totalPosts, totalReach, totalLikes, totalComments, topPost, summary },
    })

    return NextResponse.json({ report })
  } catch (error) {
    console.error('Reports POST error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

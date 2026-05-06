import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { startOfMonth, endOfMonth, addDays } from 'date-fns'

export async function GET() {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const now = new Date()
    const monthStart = startOfMonth(now)
    const monthEnd = endOfMonth(now)
    const next7 = addDays(now, 7)

    const [
      totalClients,
      activeClients,
      contentThisMonth,
      pendingApprovals,
      publishedThisMonth,
      upcomingContent,
      recentContent,
      notifications,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.client.count({ where: { isActive: true } }),
      prisma.contentItem.count({
        where: { publishDate: { gte: monthStart, lte: monthEnd } },
      }),
      prisma.contentItem.count({ where: { status: 'sent_approval' } }),
      prisma.contentItem.count({
        where: {
          status: 'published',
          publishedAt: { gte: monthStart, lte: monthEnd },
        },
      }),
      prisma.contentItem.findMany({
        where: {
          publishDate: { gte: now, lte: next7 },
          status: { notIn: ['published'] },
        },
        include: { client: { select: { businessName: true } } },
        orderBy: { publishDate: 'asc' },
        take: 10,
      }),
      prisma.contentItem.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 8,
        include: { client: { select: { businessName: true } } },
      }),
      prisma.notification.count({ where: { isRead: false } }),
    ])

    // Clients needing attention
    const allClients = await prisma.client.findMany({
      where: { isActive: true },
      include: {
        contentItems: {
          where: { publishDate: { gte: monthStart, lte: monthEnd } },
        },
      },
    })

    const needsAttention = allClients
      .filter((c) => {
        const quota = c.monthlyQuota || 0
        const published = c.contentItems.filter(
          (i) => i.status === 'published' || i.status === 'scheduled',
        ).length
        return quota > 0 && published < quota * 0.5
      })
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        businessName: c.businessName,
        quota: c.monthlyQuota,
        completed: c.contentItems.filter(
          (i) => i.status === 'published' || i.status === 'scheduled',
        ).length,
      }))

    return NextResponse.json({
      stats: {
        totalClients,
        activeClients,
        contentThisMonth,
        pendingApprovals,
        publishedThisMonth,
        notifications,
      },
      upcomingContent,
      recentContent,
      needsAttention,
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

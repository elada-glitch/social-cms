import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { scheduledAt } = await request.json()

    const item = await prisma.contentItem.update({
      where: { id },
      data: {
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(),
        status: 'scheduled',
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Schedule POST error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

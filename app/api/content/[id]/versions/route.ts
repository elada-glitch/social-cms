import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const versions = await prisma.contentVersion.findMany({
      where: { contentItemId: id },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ versions })
  } catch (error) {
    console.error('Versions GET error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

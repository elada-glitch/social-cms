import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { contentItemId, clientId, type, title } = await request.json()

    const approvalLink = await prisma.approvalLink.create({
      data: {
        clientId,
        contentItemId,
        type: type || 'single',
        title,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: 'pending',
      },
    })

    if (contentItemId) {
      await prisma.contentItem.update({
        where: { id: contentItemId },
        data: { status: 'sent_approval', approvalStatus: 'pending' },
      })
    }

    const approvalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/approval/${approvalLink.token}`
    return NextResponse.json({ approvalLink, approvalUrl })
  } catch (error) {
    console.error('Approval POST error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const item = await prisma.contentItem.findUnique({
      where: { id },
      include: { client: true },
    })

    if (!item) return NextResponse.json({ error: 'תוכן לא נמצא' }, { status: 404 })

    // Create approval link
    const approvalLink = await prisma.approvalLink.create({
      data: {
        clientId: item.clientId,
        contentItemId: id,
        type: 'single',
        title: `אישור תוכן - ${item.client.businessName}`,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'pending',
      },
    })

    // Update content status
    await prisma.contentItem.update({
      where: { id },
      data: { status: 'sent_approval', approvalStatus: 'pending' },
    })

    const approvalUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/approval/${approvalLink.token}`

    return NextResponse.json({ approvalLink, approvalUrl })
  } catch (error) {
    console.error('Approve POST error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

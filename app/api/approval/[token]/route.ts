import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params
    const link = await prisma.approvalLink.findUnique({
      where: { token },
      include: {
        client: {
          select: {
            id: true,
            businessName: true,
            industry: true,
            contactPerson: true,
          },
        },
        contentItem: {
          select: {
            id: true,
            platform: true,
            contentType: true,
            publishDate: true,
            mainCopy: true,
            hook: true,
            caption: true,
            cta: true,
            hashtags: true,
            firstComment: true,
            storyText: true,
            reelScript: true,
            notesForClient: true,
            canvaLink: true,
            googleDriveLink: true,
            status: true,
          },
        },
      },
    })

    if (!link) {
      return NextResponse.json({ error: 'קישור לא נמצא' }, { status: 404 })
    }

    // Mark as viewed
    if (!link.viewedAt) {
      await prisma.approvalLink.update({
        where: { token },
        data: { viewedAt: new Date() },
      })
    }

    return NextResponse.json({ link })
  } catch (error) {
    console.error('Approval GET error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params
    const { status, clientComment, clientName } = await request.json()

    const link = await prisma.approvalLink.findUnique({ where: { token } })
    if (!link) return NextResponse.json({ error: 'קישור לא נמצא' }, { status: 404 })

    // Update approval link
    await prisma.approvalLink.update({
      where: { token },
      data: {
        status,
        clientComment,
        clientName,
        respondedAt: new Date(),
      },
    })

    // Update content item if linked
    if (link.contentItemId) {
      await prisma.contentItem.update({
        where: { id: link.contentItemId },
        data: {
          approvalStatus: status,
          clientNotes: clientComment,
          status: status === 'approved' ? 'approved' : 'needs_changes',
        },
      })
    }

    // Create notification
    await prisma.notification.create({
      data: {
        type: status === 'approved' ? 'pending_approval' : 'pending_approval',
        message:
          status === 'approved'
            ? `הלקוח אישר את התוכן`
            : `הלקוח ביקש שינויים: ${clientComment || ''}`,
        relatedId: link.contentItemId || link.id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approval POST error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

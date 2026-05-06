import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const item = await prisma.contentItem.findUnique({
      where: { id },
      include: {
        client: true,
        assignedTo: { select: { id: true, name: true, email: true } },
        versions: { orderBy: { createdAt: 'desc' }, take: 20 },
        approvalLinks: { orderBy: { createdAt: 'desc' }, take: 5 },
      },
    })

    if (!item) return NextResponse.json({ error: 'תוכן לא נמצא' }, { status: 404 })
    return NextResponse.json({ item })
  } catch (error) {
    console.error('Content item GET error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const data = await request.json()

    // Remove fields that shouldn't be set directly
    const { client, assignedTo, versions, approvalLinks, ...updateData } = data

    const item = await prisma.contentItem.update({
      where: { id },
      data: {
        ...updateData,
        publishDate: updateData.publishDate ? new Date(updateData.publishDate) : null,
        scheduledAt: updateData.scheduledAt ? new Date(updateData.scheduledAt) : null,
        publishedAt: updateData.publishedAt ? new Date(updateData.publishedAt) : null,
      },
      include: {
        client: { select: { id: true, businessName: true } },
        assignedTo: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json({ item })
  } catch (error) {
    console.error('Content item PUT error:', error)
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
    await prisma.contentItem.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Content item DELETE error:', error)
    return NextResponse.json({ error: 'שגיאה פנימית' }, { status: 500 })
  }
}

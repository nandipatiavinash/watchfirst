import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/client'

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await prisma.watchHistory.deleteMany({ where: { id, userId: session.user.id } })
  return NextResponse.json({ ok: true })
}

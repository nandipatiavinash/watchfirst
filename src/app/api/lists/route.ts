import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/client'
import { z } from 'zod'

const CreateSchema = z.object({
  name:        z.string().min(1).max(80),
  description: z.string().max(300).optional(),
  isPublic:    z.boolean().optional().default(false),
})

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const lists = await prisma.savedList.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { items: true } } },
    orderBy: { updatedAt: 'desc' },
  })
  return NextResponse.json({ lists })
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = CreateSchema.parse(await req.json())
  const list = await prisma.savedList.create({
    data: { ...body, userId: session.user.id },
  })
  return NextResponse.json({ list })
}

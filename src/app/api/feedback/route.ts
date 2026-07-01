import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/client'
import { z } from 'zod'

const Schema = z.object({
  contentId:   z.string(),
  contentType: z.enum(['movie', 'tv_show', 'youtube']),
  score:       z.number().min(1).max(5),
  tags:        z.array(z.string()).optional().default([]),
  note:        z.string().max(500).optional(),
})

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = Schema.parse(await req.json())

  const data: any = {
    userId: session.user.id,
    score:  body.score,
    tags:   body.tags,
    note:   body.note,
  }
  if (body.contentType === 'movie')   data.movieId        = body.contentId
  if (body.contentType === 'tv_show') data.tvShowId        = body.contentId
  if (body.contentType === 'youtube') data.youtubeVideoId  = body.contentId

  const fb = await prisma.feedback.create({ data })
  return NextResponse.json({ feedback: fb })
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const feedback = await prisma.feedback.findMany({
    where: { userId: session.user.id },
    include: { movie: true, tvShow: true },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ feedback })
}

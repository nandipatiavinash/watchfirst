import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/client'
import { z } from 'zod'

const Schema = z.object({
  contentId:   z.string(),
  contentType: z.enum(['movie', 'tv_show', 'episode', 'youtube']),
  completed:   z.boolean().optional().default(false),
  progressPct: z.number().min(0).max(100).optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page  = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? '20')

  const [history, total] = await Promise.all([
    prisma.watchHistory.findMany({
      where: { userId: session.user.id },
      include: { movie: true, tvShow: true, episode: true },
      orderBy: { watchedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.watchHistory.count({ where: { userId: session.user.id } }),
  ])

  return NextResponse.json({ history, total, page, limit })
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = Schema.parse(await req.json())

  const data: any = {
    userId:      session.user.id,
    completed:   body.completed,
    progressPct: body.progressPct,
    watchedAt:   new Date(),
  }

  if (body.contentType === 'movie')   data.movieId        = body.contentId
  if (body.contentType === 'tv_show') data.tvShowId        = body.contentId
  if (body.contentType === 'episode') data.episodeId       = body.contentId
  if (body.contentType === 'youtube') data.youtubeVideoId  = body.contentId

  const entry = await prisma.watchHistory.create({ data })
  return NextResponse.json({ entry })
}

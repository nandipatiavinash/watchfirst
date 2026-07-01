import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/client'
import { youtube } from '@/lib/youtube/client'
import { mapYtVideo } from '@/lib/youtube/mappers'
import { z } from 'zod'

const Schema = z.object({
  contentId:   z.string(),
  contentType: z.enum(['movie', 'tv_show', 'youtube']),
})

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const favorites = await prisma.favorite.findMany({
    where: { userId: session.user.id },
    include: { movie: true, tvShow: true },
    orderBy: { createdAt: 'desc' },
  })

  // Hydrate YouTube favorites with live data
  const ytIds = favorites
    .filter((f: { youtubeVideoId: string | null }) => f.youtubeVideoId)
    .map((f: { youtubeVideoId: string | null }) => f.youtubeVideoId!)
  let ytMap: Record<string, ReturnType<typeof mapYtVideo>> = {}

  if (ytIds.length > 0) {
    try {
      const res = await youtube.videos(ytIds)
      ytMap = Object.fromEntries(res.items.map(v => [v.id, mapYtVideo(v)]))
    } catch (err) {
      console.error('[favorites] YouTube hydrate failed:', err)
    }
  }

  const enriched = favorites.map((f: { youtubeVideoId: string | null }) => ({
    ...f,
    youtubeVideo: f.youtubeVideoId ? ytMap[f.youtubeVideoId] ?? null : null,
  }))

  return NextResponse.json({ favorites: enriched })
}

function dataFor(userId: string, body: z.infer<typeof Schema>) {
  if (body.contentType === 'movie')   return { userId, movieId: body.contentId }
  if (body.contentType === 'tv_show') return { userId, tvShowId: body.contentId }
  return { userId, youtubeVideoId: body.contentId }
}

function whereUniqueFor(userId: string, body: z.infer<typeof Schema>) {
  if (body.contentType === 'movie')   return { userId_movieId: { userId, movieId: body.contentId } }
  if (body.contentType === 'tv_show') return { userId_tvShowId: { userId, tvShowId: body.contentId } }
  return { userId_youtubeVideoId: { userId, youtubeVideoId: body.contentId } }
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = Schema.parse(await req.json())
  const data = dataFor(session.user.id, body)

  const fav = await prisma.favorite.upsert({
    where:  whereUniqueFor(session.user.id, body) as any,
    update: {},
    create: data,
  })
  return NextResponse.json({ favorite: fav })
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = Schema.parse(await req.json())

  const where =
    body.contentType === 'movie'   ? { userId: session.user.id, movieId: body.contentId } :
    body.contentType === 'tv_show' ? { userId: session.user.id, tvShowId: body.contentId } :
                                      { userId: session.user.id, youtubeVideoId: body.contentId }

  await prisma.favorite.deleteMany({ where })
  return NextResponse.json({ ok: true })
}

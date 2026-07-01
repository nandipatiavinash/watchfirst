import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/client'
import { z } from 'zod'

const Schema = z.object({
  contentId:   z.string(),
  contentType: z.enum(['movie', 'tv_show', 'youtube']),
})

async function getOrCreateWatchlist(userId: string) {
  let list = await prisma.savedList.findFirst({ where: { userId, name: 'Watchlist' } })
  if (!list) {
    list = await prisma.savedList.create({
      data: { userId, name: 'Watchlist', description: 'My watchlist' },
    })
  }
  return list
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = Schema.parse(await req.json())
  const list = await getOrCreateWatchlist(session.user.id)

  const data: any = { savedListId: list.id }
  if (body.contentType === 'movie')   data.movieId        = body.contentId
  if (body.contentType === 'tv_show') data.tvShowId        = body.contentId
  if (body.contentType === 'youtube') data.youtubeVideoId  = body.contentId

  const item = await prisma.savedListItem.create({ data })
  return NextResponse.json({ item })
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = Schema.parse(await req.json())
  const list = await getOrCreateWatchlist(session.user.id)

  const where =
    body.contentType === 'movie'   ? { savedListId: list.id, movieId: body.contentId } :
    body.contentType === 'tv_show' ? { savedListId: list.id, tvShowId: body.contentId } :
                                      { savedListId: list.id, youtubeVideoId: body.contentId }

  await prisma.savedListItem.deleteMany({ where })
  return NextResponse.json({ ok: true })
}

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/client'
import { discoverByMood } from '@/lib/tmdb/queries'
import { getYoutubeMoodVideos } from '@/lib/youtube/queries'
import { recommendationEngine } from '@/lib/recommendation/engine'
import { z } from 'zod'
import type { MovieContent, TvShowContent } from '@/types'

const InputSchema = z.object({
  timeAvail: z.number().min(1).max(300).default(30),
  mood:      z.string().default('relaxing'),
  platform:  z.string().optional(),
  language:  z.string().optional(),
  mealMode:  z.string().optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body  = await req.json()
    const input = InputSchema.parse(body)

    // Get user tier
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { subscriptionTier: true }
    })
    const tier = user?.subscriptionTier ?? 'free'

    // Rate limiting: count recommendations created today
    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)
    const count = await prisma.recommendation.count({
      where: {
        userId: session.user.id,
        createdAt: {
          gte: startOfToday
        }
      }
    })

    const limit = tier === 'free' ? 3 : Infinity
    if (tier === 'free' && count >= limit) {
      return NextResponse.json({
        error: 'Daily limit reached. Please upgrade to Pro for unlimited recommendations.',
        limitReached: true,
        usage: { count, limit, tier }
      }, { status: 403 })
    }

    // User profile for personalisation
    const profile          = await prisma.profile.findUnique({ where: { userId: session.user.id } })
    const favoriteGenreIds = (profile?.favoriteGenreIds ?? []).map(Number)

    // Determine which sources to query
    const includeYoutube = !input.platform || input.platform === 'youtube'
    const includeTmdb    = !input.platform || input.platform !== 'youtube'

    // Fetch candidates in parallel
    const [tmdbRaw, youtubeVideos] = await Promise.all([
      includeTmdb
        ? discoverByMood(input.mood, input.timeAvail).then(items =>
            input.language ? items.filter(c => c.language === input.language) : items
          ).then(items => items.length >= 3 ? items : discoverByMood(input.mood, input.timeAvail))
        : Promise.resolve([]),
      includeYoutube
        ? getYoutubeMoodVideos(input.mood, input.timeAvail).catch(() => [])
        : Promise.resolve([]),
    ])

    const tmdbCandidates = tmdbRaw as Array<MovieContent | TvShowContent>

    // Run unified scoring + AI ranking
    const results = await recommendationEngine.run(
      {
        userId:    session.user.id,
        timeAvail: input.timeAvail as any,
        mood:      input.mood as any,
        platform:  input.platform as any,
        language:  input.language,
        mealMode:  input.mealMode as any,
      },
      tmdbCandidates,
      {
        topN: 5,
        userFavoriteGenreIds: favoriteGenreIds,
        youtubeVideos,
        subscriptionTier: tier,
      }
    )

    const providerUsed = results[0] && (results[0] as any).providerUsed
      ? (results[0] as any).providerUsed
      : 'mock'

    // Persist async (non-blocking)
    prisma.recommendation.create({
      data: {
        userId:       session.user.id,
        mood:         input.mood,
        mealMode:     input.mealMode,
        timeAvail:    input.timeAvail,
        platform:     input.platform,
        language:     input.language,
        providerUsed,
        items: {
          create: results.map((r, i) => ({
            rank:           i + 1,
            score:          r.score,
            scoreBreakdown: r.scoreBreakdown as object,
            explanation:    r.explanation ?? '',
          })),
        },
      },
    }).catch(console.error)

    return NextResponse.json({
      results,
      usage: {
        count: count + 1,
        limit,
        tier
      }
    })
  } catch (err) {
    if ((err as any)?.constructor?.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }
    console.error('[recommendations]', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

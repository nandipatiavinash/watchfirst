import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/client'
import { z } from 'zod'

const OnboardingSchema = z.object({
  timeAvail:         z.number().optional(),
  moods:             z.array(z.string()).optional(),
  platforms:         z.array(z.string()).optional(),
  languages:         z.array(z.string()).optional(),
  favoriteGenreIds:  z.array(z.number()).optional(),
  favoriteActors:    z.array(z.string()).optional(),
  favoriteDirectors: z.array(z.string()).optional(),
})

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: req.headers })
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const data = OnboardingSchema.parse(body)

    await prisma.profile.upsert({
      where:  { userId: session.user.id },
      update: {
        preferredLangs:    data.languages ?? [],
        preferredPlatforms: data.platforms ?? [],
        favoriteGenreIds:  data.favoriteGenreIds?.map(String) ?? [],
        onboardingDone:    true,
      },
      create: {
        userId:            session.user.id,
        preferredLangs:    data.languages ?? [],
        preferredPlatforms: data.platforms ?? [],
        favoriteGenreIds:  data.favoriteGenreIds?.map(String) ?? [],
        onboardingDone:    true,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    if (err instanceof z.ZodError) return NextResponse.json({ error: err.issues }, { status: 400 })
    console.error(err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

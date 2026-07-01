import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth/auth'
import prisma from '@/lib/db/client'
import { z } from 'zod'

const UpdateSchema = z.object({
  preferredLangs:     z.array(z.string()).optional(),
  preferredPlatforms: z.array(z.string()).optional(),
  favoriteGenreIds:   z.array(z.number()).optional(),
  subscriptionTier:   z.string().optional(),
})

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await prisma.profile.findUnique({ where: { userId: session.user.id } })
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { subscriptionTier: true }
  })
  return NextResponse.json({ profile, subscriptionTier: user?.subscriptionTier ?? 'free' })
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: req.headers })
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = UpdateSchema.parse(await req.json())

  const update: any = {}
  if (body.preferredLangs)     update.preferredLangs     = body.preferredLangs
  if (body.preferredPlatforms) update.preferredPlatforms = body.preferredPlatforms
  if (body.favoriteGenreIds)   update.favoriteGenreIds   = body.favoriteGenreIds.map(String)

  // Update profile
  const profile = await prisma.profile.upsert({
    where:  { userId: session.user.id },
    update,
    create: { userId: session.user.id, ...update },
  })

  // Update user subscription tier if provided
  if (body.subscriptionTier !== undefined) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { subscriptionTier: body.subscriptionTier },
    })
  }

  return NextResponse.json({ profile, subscriptionTier: body.subscriptionTier })
}

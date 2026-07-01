/**
 * Database seed script.
 * Run: npx tsx scripts/seed.ts
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const GENRES = [
  { id: 28,    name: 'Action' },
  { id: 12,    name: 'Adventure' },
  { id: 16,    name: 'Animation' },
  { id: 35,    name: 'Comedy' },
  { id: 80,    name: 'Crime' },
  { id: 99,    name: 'Documentary' },
  { id: 18,    name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14,    name: 'Fantasy' },
  { id: 36,    name: 'History' },
  { id: 27,    name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648,  name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878,   name: 'Science Fiction' },
  { id: 53,    name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37,    name: 'Western' },
  { id: 10759, name: 'Action & Adventure' },
  { id: 10762, name: 'Kids' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10768, name: 'War & Politics' },
]

const PLATFORMS = [
  { name: 'Netflix',     slug: 'netflix',    color: '#E50914' },
  { name: 'Prime Video', slug: 'prime',      color: '#00A8E0' },
  { name: 'Disney+',     slug: 'disney',     color: '#113CCF' },
  { name: 'YouTube',     slug: 'youtube',    color: '#FF0000' },
  { name: 'Crunchyroll', slug: 'crunchyroll',color: '#F47521' },
]

const FEATURE_FLAGS = [
  { key: 'ai_recommendations',  enabled: false, description: 'Enable AI-powered reranking' },
  { key: 'trending_section',    enabled: true,  description: 'Show trending content on dashboard' },
  { key: 'meal_mode',           enabled: true,  description: 'Enable meal-based recommendations' },
  { key: 'youtube_integration', enabled: false, description: 'YouTube video recommendations' },
]

async function main() {
  console.log('🌱 Seeding database...')
  for (const genre of GENRES) {
    await prisma.genre.upsert({ where: { id: genre.id }, update: { name: genre.name }, create: { id: genre.id, name: genre.name, tmdbId: genre.id } })
  }
  console.log(`✓ ${GENRES.length} genres`)
  for (const p of PLATFORMS) {
    await prisma.platform.upsert({ where: { slug: p.slug }, update: p, create: p })
  }
  console.log(`✓ ${PLATFORMS.length} platforms`)
  for (const flag of FEATURE_FLAGS) {
    await prisma.featureFlag.upsert({ where: { key: flag.key }, update: flag, create: flag })
  }
  console.log(`✓ ${FEATURE_FLAGS.length} feature flags`)
  console.log('✅ Seed complete')
}

main().catch(console.error).finally(() => prisma.$disconnect())

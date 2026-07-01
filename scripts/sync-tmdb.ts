/**
 * TMDb → PostgreSQL sync script.
 * Pulls popular + trending movies and TV shows into the DB.
 *
 * Run: npx tsx scripts/sync-tmdb.ts
 * Options:
 *   --pages <n>   Number of pages to sync per category (default 3)
 *   --type        movie | tv | all (default all)
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const TOKEN  = process.env.TMDB_READ_ACCESS_TOKEN
const BASE   = 'https://api.themoviedb.org/3'

if (!TOKEN) {
  console.error('❌  TMDB_READ_ACCESS_TOKEN not set')
  process.exit(1)
}

async function tmdb<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  if (!res.ok) throw new Error(`TMDb ${path}: ${res.status}`)
  return res.json() as T
}

interface RawMovie {
  id: number; title: string; overview: string; poster_path: string | null
  backdrop_path: string | null; release_date: string; runtime: number | null
  original_language: string; vote_average: number; popularity: number
  genre_ids?: number[]; genres?: { id: number; name: string }[]
  adult: boolean
}

interface RawTv {
  id: number; name: string; overview: string; poster_path: string | null
  backdrop_path: string | null; first_air_date: string; last_air_date?: string
  episode_run_time: number[]; original_language: string; vote_average: number
  popularity: number; number_of_seasons?: number; number_of_episodes?: number
  status?: string; genre_ids?: number[]; genres?: { id: number; name: string }[]
}

interface Page<T> { results: T[]; total_pages: number }

async function upsertGenres(genreIds: number[]) {
  for (const id of genreIds) {
    await prisma.genre.upsert({
      where:  { id },
      update: {},
      create: { id, name: String(id), tmdbId: id },
    }).catch(() => {})
  }
}

async function syncMovies(pages: number) {
  let synced = 0
  for (let page = 1; page <= pages; page++) {
    const data = await tmdb<Page<RawMovie>>('/movie/popular', { page: String(page) })

    for (const m of data.results) {
      if (m.adult) continue

      // Fetch full details for runtime + genres
      const detail = await tmdb<RawMovie>(`/movie/${m.id}`).catch(() => m)
      const genreIds: number[] = (detail.genres ?? []).map(g => g.id)
      await upsertGenres(genreIds)

      await prisma.movie.upsert({
        where:  { tmdbId: m.id },
        update: {
          title:       detail.title,
          overview:    detail.overview || null,
          posterPath:  detail.poster_path,
          backdropPath:detail.backdrop_path,
          releaseDate: detail.release_date ? new Date(detail.release_date) : null,
          runtimeMins: detail.runtime || null,
          language:    detail.original_language,
          rating:      detail.vote_average,
          popularity:  detail.popularity,
          updatedAt:   new Date(),
        },
        create: {
          tmdbId:      m.id,
          title:       detail.title,
          overview:    detail.overview || null,
          posterPath:  detail.poster_path,
          backdropPath:detail.backdrop_path,
          releaseDate: detail.release_date ? new Date(detail.release_date) : null,
          runtimeMins: detail.runtime || null,
          language:    detail.original_language,
          rating:      detail.vote_average,
          popularity:  detail.popularity,
          adult:       false,
        },
      })

      // Link genres
      const movie = await prisma.movie.findUnique({ where: { tmdbId: m.id } })
      if (movie) {
        for (const gId of genreIds) {
          await prisma.movieGenre.upsert({
            where:  { movieId_genreId: { movieId: movie.id, genreId: gId } },
            update: {},
            create: { movieId: movie.id, genreId: gId },
          }).catch(() => {})
        }
      }

      synced++
    }

    console.log(`  Movies page ${page}/${Math.min(pages, data.total_pages)} — ${synced} total`)
    await sleep(250) // respect rate limit
  }
  return synced
}

async function syncTv(pages: number) {
  let synced = 0
  for (let page = 1; page <= pages; page++) {
    const data = await tmdb<Page<RawTv>>('/tv/popular', { page: String(page) })

    for (const t of data.results) {
      const detail = await tmdb<RawTv>(`/tv/${t.id}`).catch(() => t)
      const genreIds: number[] = (detail.genres ?? []).map(g => g.id)
      await upsertGenres(genreIds)

      await prisma.tvShow.upsert({
        where:  { tmdbId: t.id },
        update: {
          title:          detail.name,
          overview:       detail.overview || null,
          posterPath:     detail.poster_path,
          backdropPath:   detail.backdrop_path,
          firstAirDate:   detail.first_air_date ? new Date(detail.first_air_date) : null,
          lastAirDate:    detail.last_air_date   ? new Date(detail.last_air_date)  : null,
          episodeRuntime: detail.episode_run_time?.[0] || null,
          language:       detail.original_language,
          rating:         detail.vote_average,
          popularity:     detail.popularity,
          status:         detail.status || null,
          totalSeasons:   detail.number_of_seasons   || null,
          totalEpisodes:  detail.number_of_episodes  || null,
          updatedAt:      new Date(),
        },
        create: {
          tmdbId:         t.id,
          title:          detail.name,
          overview:       detail.overview || null,
          posterPath:     detail.poster_path,
          backdropPath:   detail.backdrop_path,
          firstAirDate:   detail.first_air_date ? new Date(detail.first_air_date) : null,
          lastAirDate:    detail.last_air_date   ? new Date(detail.last_air_date)  : null,
          episodeRuntime: detail.episode_run_time?.[0] || null,
          language:       detail.original_language,
          rating:         detail.vote_average,
          popularity:     detail.popularity,
          status:         detail.status || null,
          totalSeasons:   detail.number_of_seasons   || null,
          totalEpisodes:  detail.number_of_episodes  || null,
        },
      })

      const show = await prisma.tvShow.findUnique({ where: { tmdbId: t.id } })
      if (show) {
        for (const gId of genreIds) {
          await prisma.tvShowGenre.upsert({
            where:  { tvShowId_genreId: { tvShowId: show.id, genreId: gId } },
            update: {},
            create: { tvShowId: show.id, genreId: gId },
          }).catch(() => {})
        }
      }

      synced++
    }

    console.log(`  TV page ${page}/${Math.min(pages, data.total_pages)} — ${synced} total`)
    await sleep(250)
  }
  return synced
}

function sleep(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

async function main() {
  const args  = process.argv.slice(2)
  const pages = Number(args[args.indexOf('--pages') + 1] || 3)
  const type  = args[args.indexOf('--type')  + 1] || 'all'

  console.log(`🎬  WatchFast TMDb sync — pages: ${pages}, type: ${type}`)
  console.log('─'.repeat(50))

  if (type === 'movie' || type === 'all') {
    console.log('📽️  Syncing movies…')
    const n = await syncMovies(pages)
    console.log(`✅  Movies done: ${n} upserted`)
  }

  if (type === 'tv' || type === 'all') {
    console.log('📺  Syncing TV shows…')
    const n = await syncTv(pages)
    console.log(`✅  TV done: ${n} upserted`)
  }

  console.log('─'.repeat(50))
  console.log('🎉  Sync complete')
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())

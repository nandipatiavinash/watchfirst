import { NextRequest, NextResponse } from 'next/server'
import { searchContent } from '@/lib/tmdb/queries'
import { searchYoutubeVideos } from '@/lib/youtube/queries'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const query   = searchParams.get('q')?.trim()
  const page    = Number(searchParams.get('page') ?? '1')
  const sources = searchParams.get('sources') ?? 'all'  // all | tmdb | youtube

  if (!query || query.length < 2) {
    return NextResponse.json({ movies: [], tvShows: [], youtubeVideos: [], totalMovies: 0, totalTv: 0, totalYoutube: 0 })
  }

  const [tmdbResults, ytResults] = await Promise.all([
    sources !== 'youtube'
      ? searchContent(query, page)
      : Promise.resolve({ movies: [], tvShows: [], totalMovies: 0, totalTv: 0 }),
    sources !== 'tmdb'
      ? searchYoutubeVideos(query, 10).catch(() => [])
      : Promise.resolve([]),
  ])

  return NextResponse.json({
    movies:        tmdbResults.movies,
    tvShows:       tmdbResults.tvShows,
    youtubeVideos: ytResults,
    totalMovies:   tmdbResults.totalMovies,
    totalTv:       tmdbResults.totalTv,
    totalYoutube:  ytResults.length,
  })
}

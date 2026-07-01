/**
 * Server-side TMDb data fetchers used by React Server Components.
 * All results are cached via Next.js fetch caching.
 */
import { tmdb } from './client'
import { mapTmdbMovie, mapTmdbTvShow } from './mappers'
import type { MovieContent, TvShowContent } from '@/types'

export type ContentItem = MovieContent | TvShowContent

export async function getTrendingAll(): Promise<ContentItem[]> {
  const [movies, tv] = await Promise.all([
    tmdb.trending.movies('week').catch(() => ({ results: [] })),
    tmdb.trending.tv('week').catch(() => ({ results: [] })),
  ])
  return [
    ...movies.results.slice(0, 10).map(mapTmdbMovie),
    ...tv.results.slice(0, 10).map(mapTmdbTvShow),
  ].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
}

export async function getTrendingMovies(): Promise<MovieContent[]> {
  const data = await tmdb.trending.movies('week').catch(() => ({ results: [] }))
  return data.results.slice(0, 10).map(mapTmdbMovie)
}

export async function getTrendingTv(): Promise<TvShowContent[]> {
  const data = await tmdb.trending.tv('week').catch(() => ({ results: [] }))
  return data.results.slice(0, 10).map(mapTmdbTvShow)
}

export async function getPopularMovies(): Promise<MovieContent[]> {
  const data = await tmdb.movie.popular().catch(() => ({ results: [] }))
  return data.results.slice(0, 10).map(mapTmdbMovie)
}

export async function getPopularTv(): Promise<TvShowContent[]> {
  const data = await tmdb.tv.popular().catch(() => ({ results: [] }))
  return data.results.slice(0, 10).map(mapTmdbTvShow)
}

export async function getHiddenGems(): Promise<ContentItem[]> {
  // High rating, lower popularity = hidden gem
  const [movies, tv] = await Promise.all([
    tmdb.movie.discover({ 'vote_average.gte': '7.5', 'vote_count.gte': '100', 'popularity.lte': '50', sort_by: 'vote_average.desc' })
      .catch(() => ({ results: [] })),
    tmdb.tv.discover({ 'vote_average.gte': '7.5', 'vote_count.gte': '50', 'popularity.lte': '50', sort_by: 'vote_average.desc' })
      .catch(() => ({ results: [] })),
  ])
  return [
    ...movies.results.slice(0, 5).map(mapTmdbMovie),
    ...tv.results.slice(0, 5).map(mapTmdbTvShow),
  ]
}

export async function getMovieDetails(tmdbId: number): Promise<MovieContent | null> {
  const m = await tmdb.movie.details(tmdbId).catch(() => null)
  if (!m) return null
  return mapTmdbMovie(m)
}

export async function getTvDetails(tmdbId: number): Promise<TvShowContent | null> {
  const t = await tmdb.tv.details(tmdbId).catch(() => null)
  if (!t) return null
  return mapTmdbTvShow(t)
}

export async function searchContent(query: string, page = 1): Promise<{
  movies: MovieContent[]
  tvShows: TvShowContent[]
  totalMovies: number
  totalTv: number
}> {
  const [movies, tv] = await Promise.all([
    tmdb.movie.search(query, String(page)).catch(() => ({ results: [], total_results: 0 })),
    tmdb.tv.search(query, String(page)).catch(() => ({ results: [], total_results: 0 })),
  ])
  return {
    movies: movies.results.map(mapTmdbMovie),
    tvShows: tv.results.map(mapTmdbTvShow),
    totalMovies: movies.total_results,
    totalTv: tv.total_results,
  }
}

export async function discoverByMood(mood: string, timeAvail?: number): Promise<ContentItem[]> {
  const MOOD_GENRES: Record<string, number[]> = {
    funny:       [35, 16],
    action:      [28, 12],
    thriller:    [53, 9648],
    mystery:     [9648, 80],
    anime:       [16],
    relaxing:    [10749, 18],
    educational: [99],
    romance:     [10749],
    horror:      [27],
  }

  const genreIds = MOOD_GENRES[mood] ?? []
  const genreParam = genreIds.join(',')
  const runtimeMax = timeAvail ? String(timeAvail + 20) : undefined

  const [movies, tv] = await Promise.all([
    tmdb.movie.discover({
      with_genres: genreParam,
      sort_by: 'popularity.desc',
      ...(runtimeMax ? { 'with_runtime.lte': runtimeMax } : {}),
    }).catch(() => ({ results: [] })),
    tmdb.tv.discover({
      with_genres: genreParam,
      sort_by: 'popularity.desc',
    }).catch(() => ({ results: [] })),
  ])

  return [
    ...movies.results.slice(0, 8).map(mapTmdbMovie),
    ...tv.results.slice(0, 8).map(mapTmdbTvShow),
  ].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
}

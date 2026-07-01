/**
 * Full content detail fetcher — real TMDb data, no mocks.
 */
import type { MovieContent, TvShowContent } from '@/types'

const BASE = 'https://api.themoviedb.org/3'

async function get<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN!
  const url = new URL(`${BASE}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: 3600 },
  })
  if (!res.ok) throw new Error(`TMDb ${path}: ${res.status}`)
  return res.json()
}

export interface StreamingOption {
  provider_id: number
  provider_name: string
  logo_path: string
  display_priority: number
}

export interface WatchProviders {
  flatrate?: StreamingOption[]
  rent?: StreamingOption[]
  buy?: StreamingOption[]
  link?: string
}

export interface CastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
}

export interface CrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

export interface MovieDetail extends MovieContent {
  tagline?: string
  budget?: number
  revenue?: number
  cast: CastMember[]
  directors: CrewMember[]
  trailer?: Video
  providers: WatchProviders
  similar: MovieContent[]
}

export interface TvDetail extends TvShowContent {
  tagline?: string
  cast: CastMember[]
  creators: { id: number; name: string; profile_path: string | null }[]
  trailer?: Video
  providers: WatchProviders
  similar: TvShowContent[]
  seasons: {
    id: number
    season_number: number
    name: string
    episode_count: number
    poster_path: string | null
    air_date: string | null
  }[]
}

export async function getMovieDetail(tmdbId: number, region = 'US'): Promise<MovieDetail | null> {
  try {
    const raw: any = await get(`/movie/${tmdbId}`, {
      append_to_response: 'credits,videos,watch/providers,similar',
    })

    const providers: WatchProviders = raw['watch/providers']?.results?.[region] ?? {}
    const trailer: Video | undefined = raw.videos?.results?.find(
      (v: Video) => v.type === 'Trailer' && v.site === 'YouTube' && v.official
    ) ?? raw.videos?.results?.find((v: Video) => v.type === 'Trailer' && v.site === 'YouTube')

    return {
      type: 'movie',
      id: String(raw.id),
      title: raw.title,
      overview: raw.overview,
      posterPath: raw.poster_path,
      backdropPath: raw.backdrop_path,
      language: raw.original_language,
      rating: raw.vote_average,
      popularity: raw.popularity,
      runtimeMins: raw.runtime ?? undefined,
      releaseDate: raw.release_date ? new Date(raw.release_date) : undefined,
      genres: raw.genres ?? [],
      tagline: raw.tagline || undefined,
      budget: raw.budget || undefined,
      revenue: raw.revenue || undefined,
      cast: (raw.credits?.cast ?? []).slice(0, 15),
      directors: (raw.credits?.crew ?? []).filter((c: CrewMember) => c.job === 'Director'),
      trailer,
      providers,
      similar: (raw.similar?.results ?? []).slice(0, 6).map((m: any) => ({
        type: 'movie' as const,
        id: String(m.id),
        title: m.title,
        overview: m.overview,
        posterPath: m.poster_path,
        backdropPath: m.backdrop_path,
        language: m.original_language,
        rating: m.vote_average,
        popularity: m.popularity,
        genres: (m.genre_ids ?? []).map((id: number) => ({ id, name: '' })),
      })),
    }
  } catch {
    return null
  }
}

export async function getTvDetail(tmdbId: number, region = 'US'): Promise<TvDetail | null> {
  try {
    const raw: any = await get(`/tv/${tmdbId}`, {
      append_to_response: 'credits,videos,watch/providers,similar',
    })

    const providers: WatchProviders = raw['watch/providers']?.results?.[region] ?? {}
    const trailer: Video | undefined = raw.videos?.results?.find(
      (v: Video) => v.type === 'Trailer' && v.site === 'YouTube' && v.official
    ) ?? raw.videos?.results?.find((v: Video) => v.type === 'Trailer' && v.site === 'YouTube')

    return {
      type: 'tv_show',
      id: String(raw.id),
      title: raw.name,
      overview: raw.overview,
      posterPath: raw.poster_path,
      backdropPath: raw.backdrop_path,
      language: raw.original_language,
      rating: raw.vote_average,
      popularity: raw.popularity,
      episodeRuntime: raw.episode_run_time?.[0] ?? undefined,
      totalSeasons: raw.number_of_seasons ?? undefined,
      status: raw.status ?? undefined,
      genres: raw.genres ?? [],
      tagline: raw.tagline || undefined,
      cast: (raw.credits?.cast ?? []).slice(0, 15),
      creators: raw.created_by ?? [],
      trailer,
      providers,
      seasons: (raw.seasons ?? []).filter((s: any) => s.season_number > 0),
      similar: (raw.similar?.results ?? []).slice(0, 6).map((t: any) => ({
        type: 'tv_show' as const,
        id: String(t.id),
        title: t.name,
        overview: t.overview,
        posterPath: t.poster_path,
        backdropPath: t.backdrop_path,
        language: t.original_language,
        rating: t.vote_average,
        popularity: t.popularity,
        genres: (t.genre_ids ?? []).map((id: number) => ({ id, name: '' })),
      })),
    }
  } catch {
    return null
  }
}

const BASE_URL = 'https://api.themoviedb.org/3'

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const token = process.env.TMDB_READ_ACCESS_TOKEN
  if (!token) throw new Error('TMDB_READ_ACCESS_TOKEN not set')

  const url = new URL(`${BASE_URL}${path}`)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    next: { revalidate: 3600 }, // cache 1 hour
  })

  if (!res.ok) {
    throw new Error(`TMDb ${path} failed: ${res.status} ${res.statusText}`)
  }

  return res.json() as Promise<T>
}

export interface TmdbMovie {
  id: number
  title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  runtime: number | null
  original_language: string
  vote_average: number
  popularity: number
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
}

export interface TmdbTvShow {
  id: number
  name: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  first_air_date: string
  episode_run_time: number[]
  original_language: string
  vote_average: number
  popularity: number
  number_of_seasons?: number
  number_of_episodes?: number
  status?: string
  genre_ids?: number[]
  genres?: { id: number; name: string }[]
}

export interface TmdbPagedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export const tmdb = {
  trending: {
    movies: (timeWindow: 'day' | 'week' = 'week') =>
      tmdbFetch<TmdbPagedResponse<TmdbMovie>>(`/trending/movie/${timeWindow}`),
    tv: (timeWindow: 'day' | 'week' = 'week') =>
      tmdbFetch<TmdbPagedResponse<TmdbTvShow>>(`/trending/tv/${timeWindow}`),
  },
  movie: {
    details: (id: number) =>
      tmdbFetch<TmdbMovie>(`/movie/${id}`, { append_to_response: 'credits,watch/providers' }),
    search: (query: string, page = '1') =>
      tmdbFetch<TmdbPagedResponse<TmdbMovie>>('/search/movie', { query, page }),
    popular: (page = '1') =>
      tmdbFetch<TmdbPagedResponse<TmdbMovie>>('/movie/popular', { page }),
    discover: (params: Record<string, string>) =>
      tmdbFetch<TmdbPagedResponse<TmdbMovie>>('/discover/movie', params),
  },
  tv: {
    details: (id: number) =>
      tmdbFetch<TmdbTvShow>(`/tv/${id}`, { append_to_response: 'credits,watch/providers' }),
    search: (query: string, page = '1') =>
      tmdbFetch<TmdbPagedResponse<TmdbTvShow>>('/search/tv', { query, page }),
    popular: (page = '1') =>
      tmdbFetch<TmdbPagedResponse<TmdbTvShow>>('/tv/popular', { page }),
    discover: (params: Record<string, string>) =>
      tmdbFetch<TmdbPagedResponse<TmdbTvShow>>('/discover/tv', params),
  },
  genres: {
    movie: () => tmdbFetch<{ genres: { id: number; name: string }[] }>('/genre/movie/list'),
    tv: () => tmdbFetch<{ genres: { id: number; name: string }[] }>('/genre/tv/list'),
  },
}

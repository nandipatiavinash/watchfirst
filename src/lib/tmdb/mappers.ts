import type { TmdbMovie, TmdbTvShow } from './client'
import type { MovieContent, TvShowContent } from '@/types'

export function mapTmdbMovie(m: TmdbMovie): MovieContent {
  return {
    type: 'movie',
    id: String(m.id),
    title: m.title,
    overview: m.overview,
    posterPath: m.poster_path,
    backdropPath: m.backdrop_path,
    language: m.original_language,
    rating: m.vote_average,
    popularity: m.popularity,
    runtimeMins: m.runtime ?? undefined,
    releaseDate: m.release_date ? new Date(m.release_date) : undefined,
    genres: (m.genres ?? m.genre_ids?.map(id => ({ id, name: '' })) ?? []),
  }
}

export function mapTmdbTvShow(t: TmdbTvShow): TvShowContent {
  return {
    type: 'tv_show',
    id: String(t.id),
    title: t.name,
    overview: t.overview,
    posterPath: t.poster_path,
    backdropPath: t.backdrop_path,
    language: t.original_language,
    rating: t.vote_average,
    popularity: t.popularity,
    episodeRuntime: t.episode_run_time?.[0] ?? undefined,
    totalSeasons: t.number_of_seasons ?? undefined,
    status: t.status ?? undefined,
    genres: (t.genres ?? t.genre_ids?.map(id => ({ id, name: '' })) ?? []),
  }
}

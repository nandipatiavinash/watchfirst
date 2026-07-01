import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Star, Clock, Calendar, Globe, Play, ArrowLeft,
  Heart, Bookmark, ThumbsUp, ExternalLink, Tv, Film
} from 'lucide-react'
import { getMovieDetail, getTvDetail } from '@/lib/tmdb/detail'
import { ContentCard } from '@/components/shared/ContentCard'
import { FavoriteButton } from '@/components/dashboard/FavoriteButton'
import { WatchlistButton } from '@/components/dashboard/WatchlistButton'
import { formatRuntime, formatDate } from '@/lib/utils/format'
import { tmdbImage } from '@/lib/utils/tmdb-image'

interface Props {
  params: Promise<{ type: string; id: string }>
}

const PLATFORM_COLORS: Record<number, string> = {
  8:   '#E50914', // Netflix
  9:   '#00A8E0', // Prime
  337: '#113CCF', // Disney+
  283: '#F47521', // Crunchyroll
  15:  '#1ce783', // Hulu
}

export async function generateMetadata({ params }: Props) {
  const { type, id } = await params
  const tmdbId = Number(id)
  const content = type === 'movie' ? await getMovieDetail(tmdbId) : await getTvDetail(tmdbId)
  if (!content) return { title: 'Not Found' }
  return {
    title: content.title,
    description: content.overview?.slice(0, 160),
    openGraph: {
      images: content.backdropPath
        ? [{ url: `https://image.tmdb.org/t/p/w1280${content.backdropPath}` }]
        : [],
    },
  }
}

export default async function ContentDetailPage({ params }: Props) {
  const { type, id } = await params
  const tmdbId = Number(id)
  if (isNaN(tmdbId)) notFound()

  const content = type === 'movie'
    ? await getMovieDetail(tmdbId)
    : await getTvDetail(tmdbId)

  if (!content) notFound()

  const isMovie = content.type === 'movie'
  const movie = isMovie ? (content as Awaited<ReturnType<typeof getMovieDetail>>)! : null
  const tv    = !isMovie ? (content as Awaited<ReturnType<typeof getTvDetail>>)! : null

  const backdrop = tmdbImage(content.backdropPath, 'w1280')
  const poster   = tmdbImage(content.posterPath, 'w500')
  const runtime  = isMovie ? movie?.runtimeMins : tv?.episodeRuntime
  const cast     = isMovie ? movie?.cast : tv?.cast
  const trailer  = isMovie ? movie?.trailer : tv?.trailer
  const providers = isMovie ? movie?.providers : tv?.providers
  const similar  = isMovie ? movie?.similar : tv?.similar
  const creators = isMovie ? movie?.directors : tv?.creators

  return (
    <div className="min-h-screen">
      {/* Hero backdrop */}
      <div className="relative h-[50vh] min-h-[340px] overflow-hidden -mx-4 sm:-mx-6 -mt-8">
        {backdrop ? (
          <Image src={backdrop} alt={content.title} fill className="object-cover" priority sizes="100vw" />
        ) : (
          <div className="w-full h-full bg-[var(--bg-secondary)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg-primary)]/80 to-transparent" />

        {/* Back button */}
        <Link
          href="/dashboard"
          className="absolute top-6 left-4 sm:left-6 flex items-center gap-2 text-sm glass px-3 py-2 rounded-xl border border-[var(--border)] hover:border-[var(--border-hover)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>

        {/* Trailer button */}
        {trailer && (
          <a
            href={`https://www.youtube.com/watch?v=${trailer.key}`}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 right-4 sm:right-6 flex items-center gap-2 bg-white/10 backdrop-blur border border-white/20 hover:bg-white/20 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
          >
            <Play className="w-4 h-4 fill-white" /> Watch trailer
          </a>
        )}
      </div>

      {/* Main content */}
      <div className="relative -mt-32 px-0 pb-16">
        <div className="flex flex-col sm:flex-row gap-8">
          {/* Poster */}
          <div className="shrink-0 mx-auto sm:mx-0">
            <div className="w-40 sm:w-52 rounded-2xl overflow-hidden border-2 border-[var(--border)] shadow-2xl">
              {poster ? (
                <Image src={poster} alt={content.title} width={208} height={312} className="w-full" />
              ) : (
                <div className="w-full aspect-[2/3] bg-[var(--bg-card)] flex items-center justify-center">
                  {isMovie ? <Film className="w-12 h-12 text-[var(--text-muted)]" /> : <Tv className="w-12 h-12 text-[var(--text-muted)]" />}
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-2">
            {/* Genres */}
            <div className="flex gap-2 flex-wrap mb-3">
              {content.genres.slice(0, 3).map((g: { id: number; name: string }) => (
                <span key={g.id} className="text-xs bg-[var(--accent)]/20 text-[var(--accent)] border border-[var(--accent)]/30 px-3 py-1 rounded-full font-medium">
                  {g.name}
                </span>
              ))}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight">{content.title}</h1>

            {(isMovie ? movie?.tagline : tv?.tagline) && (
              <p className="mt-2 text-[var(--text-secondary)] italic text-lg">
                "{isMovie ? movie?.tagline : tv?.tagline}"
              </p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap gap-4 mt-4 text-sm text-[var(--text-secondary)]">
              {content.rating && content.rating > 0 && (
                <span className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <strong className="text-[var(--text-primary)]">{content.rating.toFixed(1)}</strong>
                  <span className="text-[var(--text-muted)]">/ 10</span>
                </span>
              )}
              {runtime && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {isMovie ? formatRuntime(runtime) : `${runtime}m / episode`}
                </span>
              )}
              {isMovie && movie?.releaseDate && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(movie.releaseDate)}
                </span>
              )}
              {!isMovie && tv?.totalSeasons && (
                <span className="flex items-center gap-1.5">
                  <Tv className="w-4 h-4" />
                  {tv.totalSeasons} season{tv.totalSeasons !== 1 ? 's' : ''}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" />
                {content.language.toUpperCase()}
              </span>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 mt-6">
              <FavoriteButton contentId={content.id} contentType={content.type} />
              <WatchlistButton contentId={content.id} contentType={content.type} />
              {trailer && (
                <a
                  href={`https://www.youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
                >
                  <Play className="w-4 h-4" /> Trailer
                </a>
              )}
              <Link
                href={`/dashboard/feedback?contentId=${content.id}&type=${content.type}`}
                className="flex items-center gap-2 bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--border-hover)] text-sm font-medium px-4 py-2.5 rounded-xl transition-all"
              >
                <ThumbsUp className="w-4 h-4" /> Rate
              </Link>
            </div>

            {/* Streaming providers */}
            {providers && (providers.flatrate?.length || providers.rent?.length) ? (
              <div className="mt-6">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                  Where to watch
                </p>
                <div className="flex gap-3 flex-wrap">
                  {[...(providers.flatrate ?? []), ...(providers.rent ?? [])].slice(0, 6).map(p => (
                    <a
                      key={p.provider_id}
                      href={providers.link ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={p.provider_name}
                      className="flex items-center gap-2 glass border border-[var(--border)] hover:border-[var(--border-hover)] px-3 py-2 rounded-xl text-xs font-medium transition-all"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ background: PLATFORM_COLORS[p.provider_id] ?? '#888' }}
                      />
                      {p.provider_name}
                      <ExternalLink className="w-3 h-3 text-[var(--text-muted)]" />
                    </a>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Overview */}
        {content.overview && (
          <div className="mt-10">
            <h2 className="text-lg font-bold mb-3">Overview</h2>
            <p className="text-[var(--text-secondary)] leading-relaxed max-w-3xl">{content.overview}</p>
          </div>
        )}

        {/* TV Seasons */}
        {!isMovie && tv?.seasons && tv.seasons.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold mb-4">Seasons</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {tv.seasons.map(s => (
                <div key={s.id} className="shrink-0 w-32 glass rounded-xl border border-[var(--border)] overflow-hidden">
                  {s.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w185${s.poster_path}`}
                      alt={s.name}
                      width={128}
                      height={192}
                      className="w-full object-cover"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] bg-[var(--bg-secondary)] flex items-center justify-center">
                      <Tv className="w-8 h-8 text-[var(--text-muted)]" />
                    </div>
                  )}
                  <div className="p-2">
                    <p className="text-xs font-semibold truncate">{s.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{s.episode_count} eps</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cast */}
        {cast && cast.length > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-bold mb-4">Cast</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {cast.slice(0, 12).map(member => (
                <div key={member.id} className="shrink-0 w-24 text-center">
                  <div className="w-20 h-20 mx-auto rounded-2xl overflow-hidden bg-[var(--bg-card)] border border-[var(--border)]">
                    {member.profile_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                        alt={member.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[var(--text-muted)] text-2xl">
                        {member.name[0]}
                      </div>
                    )}
                  </div>
                  <p className="mt-1.5 text-xs font-semibold leading-tight">{member.name}</p>
                  <p className="text-xs text-[var(--text-muted)] truncate">{member.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Directors / Creators */}
        {creators && creators.length > 0 && (
          <div className="mt-8">
            <p className="text-sm text-[var(--text-secondary)]">
              <span className="font-semibold text-[var(--text-primary)]">
                {isMovie ? 'Directed by' : 'Created by'}:
              </span>{' '}
              {creators.map((c: any) => c.name).join(', ')}
            </p>
          </div>
        )}

        {/* Similar */}
        {similar && similar.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-bold mb-4">More like this</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.slice(0, 6).map(item => (
                <ContentCard key={item.id} content={item} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

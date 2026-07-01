import type { StreamingAvailabilityProvider, StreamingLink } from './streaming.interface'

const PLATFORM_MAP: Record<number, string> = {
  8:   'netflix',
  9:   'prime',
  337: 'disney',
  283: 'crunchyroll',
}

export class TmdbStreamingProvider implements StreamingAvailabilityProvider {
  readonly name = 'tmdb'

  async getAvailability(tmdbId: number, type: 'movie' | 'tv', region = 'US'): Promise<StreamingLink[]> {
    const token = process.env.TMDB_READ_ACCESS_TOKEN
    if (!token) return []

    const path = type === 'movie' ? `/movie/${tmdbId}/watch/providers` : `/tv/${tmdbId}/watch/providers`
    const res = await fetch(`https://api.themoviedb.org/3${path}`, {
      headers: { Authorization: `Bearer ${token}` },
      next: { revalidate: 86400 },
    })

    if (!res.ok) return []

    const data = await res.json()
    const regionData = data.results?.[region]
    if (!regionData) return []

    const links: StreamingLink[] = []

    for (const [type, items] of Object.entries(regionData) as [string, any[]][]) {
      if (type === 'link') continue
      for (const item of items ?? []) {
        const slug = PLATFORM_MAP[item.provider_id]
        if (slug) {
          links.push({
            platformSlug: slug,
            platformName: item.provider_name,
            type: type as StreamingLink['type'],
            url: regionData.link,
          })
        }
      }
    }

    return links
  }
}

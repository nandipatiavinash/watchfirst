/**
 * Streaming availability abstraction layer.
 * Swap providers (TMDb watch/providers, JustWatch, etc.) without touching business logic.
 */

export interface StreamingLink {
  platformSlug: string
  platformName: string
  type: 'flatrate' | 'rent' | 'buy'
  url?: string
}

export interface StreamingAvailabilityProvider {
  readonly name: string
  getAvailability(tmdbId: number, type: 'movie' | 'tv', region?: string): Promise<StreamingLink[]>
}

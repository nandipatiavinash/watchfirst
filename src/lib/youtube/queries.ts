/**
 * Server-side YouTube query functions used by Server Components and API routes.
 * All results fetched fresh or from Next.js cache (revalidate: 3600).
 */
import { youtube } from './client'
import { mapYtVideo, mapYtSearchItem, parseDuration } from './mappers'
import type { YoutubeContent } from '@/types'

// Mood → YouTube search query + preferred category
const MOOD_YT_QUERIES: Record<string, { query: string; categoryId: string }> = {
  funny:       { query: 'stand up comedy funny videos',       categoryId: '23' },
  action:      { query: 'action adventure short film',        categoryId: '1'  },
  thriller:    { query: 'thriller suspense short film',       categoryId: '1'  },
  mystery:     { query: 'mystery documentary true crime',     categoryId: '25' },
  anime:       { query: 'anime episode highlights recap',     categoryId: '1'  },
  relaxing:    { query: 'relaxing music nature ambience',     categoryId: '10' },
  educational: { query: 'educational documentary learn',      categoryId: '27' },
  romance:     { query: 'romantic short film love story',     categoryId: '1'  },
  horror:      { query: 'horror short film scary',            categoryId: '1'  },
}

/**
 * Get trending YouTube videos for a specific mood.
 * Searches by query then hydrates with full details (duration, stats).
 */
export async function getYoutubeMoodVideos(
  mood: string,
  timeAvail: number
): Promise<YoutubeContent[]> {
  const { query, categoryId } = MOOD_YT_QUERIES[mood] ?? {
    query: 'popular videos', categoryId: '24',
  }

  try {
    // 1. Search
    const searchRes = await youtube.search(query, 15)
    const videoIds  = searchRes.items.map(i => i.id.videoId).filter(Boolean)
    if (!videoIds.length) return []

    // 2. Hydrate with full details
    const detailRes = await youtube.videos(videoIds)
    const videos    = detailRes.items.map(mapYtVideo)

    // 3. Filter by duration (±30 min window)
    return videos.filter(
      v => v.durationMins > 0 && v.durationMins <= timeAvail + 30
    )
  } catch (err) {
    console.error('[YouTube] getYoutubeMoodVideos:', err)
    return []
  }
}

/**
 * Get popular YouTube videos for a given category.
 */
export async function getYoutubePopular(
  categoryId = '24',
  maxResults = 10
): Promise<YoutubeContent[]> {
  try {
    const res = await youtube.popular(categoryId, maxResults)
    return res.items.map(mapYtVideo)
  } catch (err) {
    console.error('[YouTube] getYoutubePopular:', err)
    return []
  }
}

/**
 * Search YouTube videos by query string.
 * Returns items enriched with full duration/stats.
 */
export async function searchYoutubeVideos(
  query: string,
  maxResults = 20
): Promise<YoutubeContent[]> {
  try {
    const searchRes = await youtube.search(query, maxResults)
    const ids       = searchRes.items.map(i => i.id.videoId).filter(Boolean)
    if (!ids.length) return []

    const detailRes = await youtube.videos(ids)
    return detailRes.items.map(mapYtVideo)
  } catch (err) {
    console.error('[YouTube] searchYoutubeVideos:', err)
    return []
  }
}

/**
 * Get full details for a single YouTube video by videoId.
 */
export async function getYoutubeVideoDetail(videoId: string): Promise<YoutubeContent | null> {
  try {
    const res = await youtube.videos(videoId)
    const v   = res.items[0]
    if (!v) return null
    return mapYtVideo(v)
  } catch (err) {
    console.error('[YouTube] getYoutubeVideoDetail:', err)
    return null
  }
}

/**
 * Trending videos across popular categories for dashboard.
 */
export async function getYoutubeTrending(): Promise<YoutubeContent[]> {
  const categoryIds = ['24', '23', '27', '28'] // Entertainment, Comedy, Education, Science
  try {
    const results = await Promise.all(
      categoryIds.map(id => youtube.popular(id, 5).then(r => r.items.map(mapYtVideo)).catch(() => []))
    )
    return results.flat().sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0))
  } catch (err) {
    console.error('[YouTube] getYoutubeTrending:', err)
    return []
  }
}

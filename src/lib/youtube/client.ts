/**
 * YouTube Data API v3 client.
 * Uses server-side API key — never exposed to browser.
 */

const BASE = 'https://www.googleapis.com/youtube/v3'

async function ytFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const key = process.env.YOUTUBE_API_KEY
  if (!key) throw new Error('YOUTUBE_API_KEY not set')

  const url = new URL(`${BASE}${path}`)
  url.searchParams.set('key', key)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), { next: { revalidate: 3600 } })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`YouTube ${path}: ${res.status} — ${body.slice(0, 200)}`)
  }
  return res.json() as T
}

// ─── Raw API types ────────────────────────────────────────────────────────────

export interface YtThumbnail { url: string; width: number; height: number }

export interface YtSnippet {
  publishedAt:  string
  channelId:    string
  title:        string
  description:  string
  channelTitle: string
  tags?:        string[]
  categoryId:   string
  defaultLanguage?: string
  thumbnails: {
    default?:  YtThumbnail
    medium?:   YtThumbnail
    high?:     YtThumbnail
    standard?: YtThumbnail
    maxres?:   YtThumbnail
  }
}

export interface YtContentDetails {
  duration:        string   // ISO 8601
  definition:      string
  caption:         string
}

export interface YtStatistics {
  viewCount:     string
  likeCount?:    string
  commentCount?: string
}

export interface YtVideo {
  id:             string
  snippet:        YtSnippet
  contentDetails: YtContentDetails
  statistics:     YtStatistics
}

export interface YtSearchItem {
  id:      { videoId: string }
  snippet: YtSnippet
}

export interface YtPagedResponse<T> {
  items:           T[]
  nextPageToken?:  string
  pageInfo:        { totalResults: number; resultsPerPage: number }
}

// ─── API methods ──────────────────────────────────────────────────────────────

export const youtube = {
  /**
   * Search for videos matching a query.
   */
  search(query: string, maxResults = 20, pageToken?: string) {
    const params: Record<string, string> = {
      part:       'snippet',
      q:          query,
      type:       'video',
      maxResults: String(maxResults),
      safeSearch: 'moderate',
      videoEmbeddable: 'true',
    }
    if (pageToken) params.pageToken = pageToken
    return ytFetch<YtPagedResponse<YtSearchItem>>('/search', params)
  },

  /**
   * Get full details for one or more video IDs (comma-separated).
   */
  videos(ids: string | string[]) {
    const idStr = Array.isArray(ids) ? ids.join(',') : ids
    return ytFetch<YtPagedResponse<YtVideo>>('/videos', {
      part:       'snippet,contentDetails,statistics',
      id:         idStr,
      maxResults: '50',
    })
  },

  /**
   * Get popular videos by category.
   * categoryId: 1=Film&Animation, 10=Music, 22=People, 23=Comedy,
   *             24=Entertainment, 25=News, 26=How-To, 27=Education, 28=Science&Tech
   */
  popular(categoryId: string, maxResults = 20, regionCode = 'US') {
    return ytFetch<YtPagedResponse<YtVideo>>('/videos', {
      part:       'snippet,contentDetails,statistics',
      chart:      'mostPopular',
      videoCategoryId: categoryId,
      maxResults: String(maxResults),
      regionCode,
    })
  },
}

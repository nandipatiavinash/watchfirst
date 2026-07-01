import type { YtVideo, YtSearchItem } from './client'
import type { YoutubeContent } from '@/types'

// YouTube category → pseudo-genre mapping
const CATEGORY_GENRES: Record<string, { id: number; name: string }[]> = {
  '1':  [{ id: 9999, name: 'Film & Animation' }],
  '10': [{ id: 9998, name: 'Music' }],
  '22': [{ id: 9997, name: 'People & Blogs' }],
  '23': [{ id: 35,   name: 'Comedy' }],
  '24': [{ id: 9996, name: 'Entertainment' }],
  '25': [{ id: 9995, name: 'News' }],
  '26': [{ id: 9994, name: 'How-To' }],
  '27': [{ id: 99,   name: 'Education' }],
  '28': [{ id: 878,  name: 'Science & Tech' }],
  '29': [{ id: 9993, name: 'Nonprofits' }],
}

/**
 * Parse ISO 8601 duration string (PT1H2M3S) to total minutes.
 */
export function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return 0
  const h = Number(match[1] ?? 0)
  const m = Number(match[2] ?? 0)
  const s = Number(match[3] ?? 0)
  return Math.round(h * 60 + m + s / 60)
}

export function mapYtVideo(v: YtVideo): YoutubeContent {
  const thumb =
    v.snippet.thumbnails.maxres?.url ??
    v.snippet.thumbnails.standard?.url ??
    v.snippet.thumbnails.high?.url ??
    v.snippet.thumbnails.medium?.url ??
    v.snippet.thumbnails.default?.url ?? ''

  const durationMins = parseDuration(v.contentDetails.duration)
  const catId        = v.snippet.categoryId ?? '24'

  // Normalise popularity: viewCount mapped to 0-1000 scale for scorer
  const views = Number(v.statistics.viewCount ?? 0)

  return {
    type:         'youtube',
    id:           `yt_${v.id}`,
    videoId:      v.id,
    title:        v.snippet.title,
    overview:     v.snippet.description.slice(0, 500) || null,
    posterPath:   null,           // not used; thumbnailUrl is used instead
    backdropPath: null,
    thumbnailUrl: thumb,
    embedUrl:     `https://www.youtube.com/embed/${v.id}`,
    language:     v.snippet.defaultLanguage ?? 'en',
    rating:       null,           // YouTube has no star rating
    popularity:   Math.min(views / 1_000_000, 1000), // scale for scorer
    durationISO:  v.contentDetails.duration,
    durationMins,
    viewCount:    views,
    likeCount:    v.statistics.likeCount ? Number(v.statistics.likeCount) : undefined,
    publishedAt:  v.snippet.publishedAt,
    channelId:    v.snippet.channelId,
    channelTitle: v.snippet.channelTitle,
    tags:         v.snippet.tags ?? [],
    categoryId:   catId,
    genres:       CATEGORY_GENRES[catId] ?? [{ id: 24, name: 'Entertainment' }],
  }
}

export function mapYtSearchItem(item: YtSearchItem, durationMins = 10): YoutubeContent {
  const thumb =
    item.snippet.thumbnails.high?.url ??
    item.snippet.thumbnails.medium?.url ??
    item.snippet.thumbnails.default?.url ?? ''

  const catId = item.snippet.categoryId ?? '24'

  return {
    type:         'youtube',
    id:           `yt_${item.id.videoId}`,
    videoId:      item.id.videoId,
    title:        item.snippet.title,
    overview:     item.snippet.description.slice(0, 500) || null,
    posterPath:   null,
    backdropPath: null,
    thumbnailUrl: thumb,
    embedUrl:     `https://www.youtube.com/embed/${item.id.videoId}`,
    language:     item.snippet.defaultLanguage ?? 'en',
    rating:       null,
    popularity:   50,
    durationISO:  '',
    durationMins,
    viewCount:    0,
    publishedAt:  item.snippet.publishedAt,
    channelId:    item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    tags:         [],
    categoryId:   catId,
    genres:       CATEGORY_GENRES[catId] ?? [{ id: 24, name: 'Entertainment' }],
  }
}

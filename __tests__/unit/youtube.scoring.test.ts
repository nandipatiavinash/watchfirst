import { scoreYoutubeVideo } from '@/lib/youtube/scoring'
import type { YoutubeContent, RecommendationInput } from '@/types'

const baseVideo: YoutubeContent = {
  type: 'youtube',
  id: 'yt_abc123',
  videoId: 'abc123',
  title: 'Funny Stand Up Special',
  language: 'en',
  rating: null,
  popularity: 50,
  durationISO: 'PT15M',
  durationMins: 15,
  viewCount: 5_000_000,
  publishedAt: new Date().toISOString(),
  channelId: 'chan1',
  channelTitle: 'Comedy Channel',
  tags: ['comedy', 'standup'],
  categoryId: '23', // Comedy
  genres: [{ id: 35, name: 'Comedy' }],
  thumbnailUrl: 'https://example.com/thumb.jpg',
  embedUrl: 'https://youtube.com/embed/abc123',
}

const baseInput: RecommendationInput = {
  userId: 'u1', timeAvail: 20, mood: 'funny',
}

describe('scoreYoutubeVideo', () => {
  it('returns score between 0 and 1', () => {
    const result = scoreYoutubeVideo(baseVideo, baseInput)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it('scores duration highly when it matches timeAvail', () => {
    const result = scoreYoutubeVideo(baseVideo, baseInput)
    expect(result.scoreBreakdown.durationMatch).toBeGreaterThanOrEqual(0.8)
  })

  it('scores mood/category match highly for comedy + funny', () => {
    const result = scoreYoutubeVideo(baseVideo, { ...baseInput, mood: 'funny' })
    expect(result.scoreBreakdown.genreMatch).toBe(1.0)
  })

  it('scores mood match low for mismatched category', () => {
    const result = scoreYoutubeVideo(baseVideo, { ...baseInput, mood: 'educational' })
    expect(result.scoreBreakdown.genreMatch).toBeLessThan(0.5)
  })

  it('boosts platformMatch when platform is youtube', () => {
    const withYtPlatform  = scoreYoutubeVideo(baseVideo, { ...baseInput, platform: 'youtube' })
    const withoutPlatform = scoreYoutubeVideo(baseVideo, baseInput)
    expect(withYtPlatform.scoreBreakdown.platformMatch).toBeGreaterThan(withoutPlatform.scoreBreakdown.platformMatch)
  })

  it('scores recent videos higher than old videos', () => {
    const recentVideo = { ...baseVideo, publishedAt: new Date().toISOString() }
    const oldVideo     = { ...baseVideo, publishedAt: new Date('2015-01-01').toISOString() }
    const recentScore  = scoreYoutubeVideo(recentVideo, baseInput).scoreBreakdown.recency
    const oldScore      = scoreYoutubeVideo(oldVideo, baseInput).scoreBreakdown.recency
    expect(recentScore).toBeGreaterThan(oldScore)
  })

  it('scales popularity based on view count', () => {
    const popular   = { ...baseVideo, viewCount: 40_000_000 }
    const unpopular = { ...baseVideo, viewCount: 1000 }
    const popularScore   = scoreYoutubeVideo(popular, baseInput).scoreBreakdown.popularity
    const unpopularScore = scoreYoutubeVideo(unpopular, baseInput).scoreBreakdown.popularity
    expect(popularScore).toBeGreaterThan(unpopularScore)
  })

  it('returns the original video as content', () => {
    const result = scoreYoutubeVideo(baseVideo, baseInput)
    expect(result.content).toBe(baseVideo)
  })
})

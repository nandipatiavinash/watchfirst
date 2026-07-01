/**
 * Score a YouTube video against user input.
 * Extends the core scoring engine for YouTube-specific signals.
 */
import type { YoutubeContent, RecommendationInput, ScoredAnyContent, ScoreBreakdown, ScoringWeights } from '@/types'
import { DEFAULT_WEIGHTS } from '@/types'

const MOOD_CATEGORY_MAP: Record<string, string[]> = {
  funny:       ['23', '24'],      // Comedy, Entertainment
  action:      ['1', '24'],       // Film, Entertainment
  thriller:    ['1', '24'],
  mystery:     ['25', '1'],       // News, Film
  anime:       ['1'],
  relaxing:    ['10', '26'],      // Music, How-To
  educational: ['27', '28', '25'],// Education, Science, News
  romance:     ['1', '24'],
  horror:      ['1'],
}

function clamp(v: number) { return Math.max(0, Math.min(1, v)) }

function scoreDuration(v: YoutubeContent, timeAvail: number): number {
  if (!v.durationMins) return 0.5
  const diff = Math.abs(v.durationMins - timeAvail)
  if (diff <= 3)  return 1.0
  if (diff <= 10) return 0.8
  if (diff <= 20) return 0.5
  if (diff <= 40) return 0.2
  return 0
}

function scoreMood(v: YoutubeContent, mood: string): number {
  const preferred = MOOD_CATEGORY_MAP[mood] ?? []
  return preferred.includes(v.categoryId) ? 1.0 : 0.3
}

function scoreRecency(publishedAt: string): number {
  const ageMs  = Date.now() - new Date(publishedAt).getTime()
  const ageDays = ageMs / (1000 * 60 * 60 * 24)
  if (ageDays < 7)   return 1.0
  if (ageDays < 30)  return 0.8
  if (ageDays < 180) return 0.6
  if (ageDays < 365) return 0.4
  return 0.2
}

function getTimeOfDayBoost(): number {
  const h = new Date().getHours()
  if (h >= 6  && h < 12) return 0.3
  if (h >= 12 && h < 17) return 0.5
  if (h >= 17 && h < 21) return 0.8
  return 1.0
}

export function scoreYoutubeVideo(
  video:    YoutubeContent,
  input:    RecommendationInput,
  weights:  ScoringWeights = DEFAULT_WEIGHTS,
): ScoredAnyContent {
  const breakdown: ScoreBreakdown = {
    durationMatch:    scoreDuration(video, input.timeAvail),
    genreMatch:       scoreMood(video, input.mood),
    moodMatch:        scoreMood(video, input.mood),
    languageMatch:    input.language
      ? (video.language === input.language ? 1 : 0.3)
      : 0.5,
    platformMatch:    input.platform === 'youtube' ? 1.0 : 0.4,
    popularity:       clamp((video.viewCount ?? 0) / 50_000_000),
    rating:           0.5,      // YouTube has no star rating
    recency:          scoreRecency(video.publishedAt),
    favoriteActor:    0,
    favoriteDirector: 0,
    timeOfDay:        getTimeOfDayBoost(),
    mealMode:         0.5,
    personalHistory:  0.5,
    userFeedback:     0.5,
  }

  const score = (Object.keys(breakdown) as Array<keyof ScoreBreakdown>).reduce(
    (sum, key) => sum + breakdown[key] * (weights[key] ?? 0),
    0
  )

  return { content: video, score: clamp(score), scoreBreakdown: breakdown }
}

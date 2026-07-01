import type {
  RecommendationInput,
  ScoredContent,
  ScoreBreakdown,
  ScoringWeights,
  MovieContent,
  TvShowContent,
  DEFAULT_WEIGHTS,
} from '@/types'
import { DEFAULT_WEIGHTS as WEIGHTS } from '@/types'

const MOOD_GENRE_MAP: Record<string, number[]> = {
  funny:       [35, 16, 10751],
  action:      [28, 12, 10759],
  thriller:    [53, 80, 9648],
  mystery:     [9648, 80, 53],
  anime:       [16, 10759, 14],
  relaxing:    [10749, 18, 99],
  educational: [99, 36, 878],
  romance:     [10749, 18, 35],
  horror:      [27, 53, 9648],
}

const MEAL_MOOD_MAP: Record<string, string[]> = {
  breakfast:  ['funny', 'relaxing', 'educational'],
  lunch:      ['action', 'thriller', 'mystery'],
  dinner:     ['romance', 'drama', 'relaxing'],
  late_night: ['horror', 'thriller', 'mystery', 'anime'],
}

function clamp(v: number): number {
  return Math.max(0, Math.min(1, v))
}

function getTimeOfDayBoost(): number {
  const hour = new Date().getHours()
  if (hour >= 6  && hour < 12) return 0.3   // morning
  if (hour >= 12 && hour < 17) return 0.5   // afternoon
  if (hour >= 17 && hour < 21) return 0.8   // prime time
  return 1.0                                 // late night
}

function scoreDuration(content: MovieContent | TvShowContent, timeAvail: number): number {
  const runtime = content.type === 'movie'
    ? content.runtimeMins
    : content.episodeRuntime

  if (!runtime) return 0.5

  const diff = Math.abs(runtime - timeAvail)
  if (diff <= 5)  return 1.0
  if (diff <= 15) return 0.8
  if (diff <= 30) return 0.5
  if (diff <= 60) return 0.2
  return 0
}

function scoreGenres(content: MovieContent | TvShowContent, mood: string): number {
  const preferred = MOOD_GENRE_MAP[mood] ?? []
  const contentGenreIds = content.genres.map(g => g.id)
  const matches = contentGenreIds.filter(id => preferred.includes(id))
  return clamp(matches.length / Math.max(preferred.length, 1))
}

function scoreMealMode(mood: string, mealMode?: string): number {
  if (!mealMode) return 0.5
  const preferred = MEAL_MOOD_MAP[mealMode] ?? []
  return preferred.includes(mood) ? 1.0 : 0.2
}

export function scoreContent(
  content: MovieContent | TvShowContent,
  input: RecommendationInput,
  weights: ScoringWeights = WEIGHTS,
  userFavoriteGenreIds: number[] = [],
  userFeedbackScore: number = 0.5,
): ScoredContent {
  const breakdown: ScoreBreakdown = {
    durationMatch:   scoreDuration(content, input.timeAvail),
    genreMatch:      scoreGenres(content, input.mood),
    moodMatch:       scoreGenres(content, input.mood), // alias for now
    languageMatch:   input.language
      ? content.language === input.language ? 1 : 0.3
      : 0.5,
    platformMatch:   0.5, // resolved by provider layer
    popularity:      clamp((content.popularity ?? 0) / 1000),
    rating:          clamp((content.rating ?? 0) / 10),
    recency:         0.5,
    favoriteActor:   0,   // resolved by behavior engine
    favoriteDirector:0,
    timeOfDay:       getTimeOfDayBoost(),
    mealMode:        scoreMealMode(input.mood, input.mealMode),
    personalHistory: 0.5,
    userFeedback:    userFeedbackScore,
  }

  // genre match against user profile
  if (userFavoriteGenreIds.length > 0) {
    const contentGenreIds = content.genres.map(g => g.id)
    const profileMatches = contentGenreIds.filter(id => userFavoriteGenreIds.includes(id))
    breakdown.genreMatch = clamp(
      (breakdown.genreMatch + profileMatches.length / Math.max(userFavoriteGenreIds.length, 1)) / 2
    )
  }

  const score = (Object.keys(breakdown) as Array<keyof ScoreBreakdown>).reduce(
    (sum, key) => sum + breakdown[key] * (weights[key] ?? 0),
    0
  )

  return { content, score: clamp(score), scoreBreakdown: breakdown }
}

// ─── Content Types ────────────────────────────────────────────────────────────

export type ContentType = 'movie' | 'tv_show' | 'episode'

export interface BaseContent {
  id: string
  title: string
  overview?: string | null
  posterPath?: string | null
  backdropPath?: string | null
  language: string
  rating?: number | null
  popularity?: number | null
}

export interface MovieContent extends BaseContent {
  type: 'movie'
  runtimeMins?: number | null
  releaseDate?: Date | null
  genres: { id: number; name: string }[]
}

export interface TvShowContent extends BaseContent {
  type: 'tv_show'
  episodeRuntime?: number | null
  totalSeasons?: number | null
  status?: string | null
  genres: { id: number; name: string }[]
}

// ─── Recommendation Types ─────────────────────────────────────────────────────

export type Mood =
  | 'funny'
  | 'action'
  | 'thriller'
  | 'mystery'
  | 'anime'
  | 'relaxing'
  | 'educational'
  | 'romance'
  | 'horror'

export type MealMode = 'breakfast' | 'lunch' | 'dinner' | 'late_night'

export type Platform =
  | 'netflix'
  | 'prime'
  | 'disney'
  | 'youtube'
  | 'crunchyroll'

export type TimeAvail = 5 | 10 | 20 | 30 | 45 | 60

export interface RecommendationInput {
  userId: string
  timeAvail: TimeAvail
  mood: Mood
  platform?: Platform
  language?: string
  mealMode?: MealMode
}

export interface ScoredContent {
  content: MovieContent | TvShowContent
  score: number
  scoreBreakdown: ScoreBreakdown
  explanation?: string
}

export interface ScoreBreakdown {
  durationMatch: number
  genreMatch: number
  moodMatch: number
  languageMatch: number
  platformMatch: number
  popularity: number
  rating: number
  recency: number
  favoriteActor: number
  favoriteDirector: number
  timeOfDay: number
  mealMode: number
  personalHistory: number
  userFeedback: number
}

// ─── Scoring Weights ──────────────────────────────────────────────────────────

export interface ScoringWeights {
  durationMatch: number
  genreMatch: number
  moodMatch: number
  languageMatch: number
  platformMatch: number
  popularity: number
  rating: number
  recency: number
  favoriteActor: number
  favoriteDirector: number
  timeOfDay: number
  mealMode: number
  personalHistory: number
  userFeedback: number
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  durationMatch: 0.15,
  genreMatch: 0.15,
  moodMatch: 0.15,
  languageMatch: 0.10,
  platformMatch: 0.10,
  popularity: 0.05,
  rating: 0.08,
  recency: 0.04,
  favoriteActor: 0.06,
  favoriteDirector: 0.04,
  timeOfDay: 0.03,
  mealMode: 0.03,
  personalHistory: 0.01,
  userFeedback: 0.01,
}

// ─── User / Onboarding ────────────────────────────────────────────────────────

export interface OnboardingData {
  timeAvail: TimeAvail
  moods: Mood[]
  platforms: Platform[]
  languages: string[]
  mealMode?: MealMode
  favoriteGenreIds: number[]
  favoriteActors: string[]
  favoriteDirectors: string[]
}

// ─── API Response Helpers ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// ─── YouTube Content ──────────────────────────────────────────────────────────

export interface YoutubeContent extends BaseContent {
  type:         'youtube'
  videoId:      string
  channelId:    string
  channelTitle: string
  durationISO:  string        // ISO 8601 e.g. "PT12M34S"
  durationMins: number
  viewCount:    number
  likeCount?:   number
  publishedAt:  string
  tags:         string[]
  categoryId:   string
  genres:       { id: number; name: string }[]  // mapped from category
  thumbnailUrl: string
  embedUrl:     string
}

export type AnyContent = MovieContent | TvShowContent | YoutubeContent

export interface ScoredAnyContent {
  content:        AnyContent
  score:          number
  scoreBreakdown: ScoreBreakdown
  explanation?:   string
}

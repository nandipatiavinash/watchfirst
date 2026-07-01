import type {
  RecommendationInput, ScoredContent, ScoredAnyContent,
  MovieContent, TvShowContent, YoutubeContent,
} from '@/types'
import type { RecommendationProvider } from './provider.interface'
import { MockRecommendationProvider } from './mock.provider'
import { GeminiRecommendationProvider } from './gemini.provider'
import { scoreContent } from './scoring.engine'
import { scoreYoutubeVideo } from '@/lib/youtube/scoring'
import { DEFAULT_WEIGHTS } from '@/types'

export class RecommendationEngine {
  private provider: RecommendationProvider

  constructor(provider?: RecommendationProvider) {
    if (provider) {
      this.provider = provider
    } else {
      const hasGemini = typeof process !== 'undefined' && !!process.env.GEMINI_API_KEY
      this.provider = hasGemini
        ? new GeminiRecommendationProvider()
        : new MockRecommendationProvider()
    }
  }

  async run(
    input: RecommendationInput,
    candidates: Array<MovieContent | TvShowContent>,
    options: {
      topN?: number
      userFavoriteGenreIds?: number[]
      youtubeVideos?: YoutubeContent[]
      subscriptionTier?: string
    } = {}
  ): Promise<ScoredAnyContent[]> {
    const { topN = 5, userFavoriteGenreIds = [], youtubeVideos = [], subscriptionTier = 'free' } = options

    // ── 1. Filter TMDb candidates by time window ──────────────────────────────
    const filtered = candidates.filter(c => {
      const runtime = c.type === 'movie' ? c.runtimeMins : c.episodeRuntime
      if (!runtime) return true
      return runtime <= input.timeAvail + 20
    })

    // ── 2. Score TMDb content ─────────────────────────────────────────────────
    const scoredTmdb: ScoredAnyContent[] = filtered.map(c =>
      scoreContent(c, input, DEFAULT_WEIGHTS, userFavoriteGenreIds) as ScoredAnyContent
    )

    // ── 3. Score YouTube content (if any supplied) ────────────────────────────
    const scoredYt: ScoredAnyContent[] = youtubeVideos
      .filter(v => v.durationMins <= input.timeAvail + 30)
      .map(v => scoreYoutubeVideo(v, input, DEFAULT_WEIGHTS))

    // ── 4. Merge and rank all candidates ─────────────────────────────────────
    const merged = [...scoredTmdb, ...scoredYt].sort((a, b) => b.score - a.score)

    // ── 5. Resolve active provider based on subscription tier ────────────────
    const isPro = subscriptionTier === 'premium' || subscriptionTier === 'pro'
    const activeProvider = isPro ? this.provider : new MockRecommendationProvider()

    // ── 6. AI provider rerank (top 20 pool → pick topN) ──────────────────────
    const pool      = merged.slice(0, 20) as ScoredContent[]
    const reranked  = await activeProvider.recommend(input, pool, topN) as ScoredAnyContent[]

    // ── 7. Attach explanations ────────────────────────────────────────────────
    const explained = await Promise.all(
      reranked.map(async item => ({
        ...item,
        explanation: await activeProvider.explain(input, item as ScoredContent),
      }))
    )

    // Store details about provider used on each item
    explained.forEach(item => {
      (item as any).providerUsed = activeProvider.name
    })

    return explained
  }

  setProvider(provider: RecommendationProvider) {
    this.provider = provider
  }

  getProviderName(): string {
    return this.provider.name
  }
}

export const recommendationEngine = new RecommendationEngine()


import type { RecommendationInput, ScoredContent } from '@/types'

/**
 * AI Recommendation Provider Interface.
 * Swap in OpenAI, Gemini, Ollama, etc. without changing business logic.
 */
export interface RecommendationProvider {
  readonly name: string

  /**
   * Given scored candidates, return top N recommendations.
   * May use AI to rerank or filter.
   */
  recommend(
    input: RecommendationInput,
    candidates: ScoredContent[],
    topN?: number
  ): Promise<ScoredContent[]>

  /**
   * Rerank already-recommended items using AI signals.
   */
  rerank(
    input: RecommendationInput,
    items: ScoredContent[]
  ): Promise<ScoredContent[]>

  /**
   * Generate a human-readable explanation for a recommendation.
   */
  explain(
    input: RecommendationInput,
    item: ScoredContent
  ): Promise<string>
}

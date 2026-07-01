import type { RecommendationProvider } from './provider.interface'
import type { RecommendationInput, ScoredContent } from '@/types'

/**
 * Mock provider — no external dependencies.
 * Returns pre-scored candidates sorted by score.
 * Replace with OpenAI/Gemini provider when ready.
 */
export class MockRecommendationProvider implements RecommendationProvider {
  readonly name = 'mock'

  async recommend(
    _input: RecommendationInput,
    candidates: ScoredContent[],
    topN = 5
  ): Promise<ScoredContent[]> {
    return [...candidates]
      .sort((a, b) => b.score - a.score)
      .slice(0, topN)
  }

  async rerank(
    _input: RecommendationInput,
    items: ScoredContent[]
  ): Promise<ScoredContent[]> {
    // No-op for mock — return as-is
    return items
  }

  async explain(
    input: RecommendationInput,
    item: ScoredContent
  ): Promise<string> {
    const { mood, timeAvail, mealMode } = input
    const { content, scoreBreakdown } = item
    const topFactor = Object.entries(scoreBreakdown)
      .sort(([, a], [, b]) => b - a)[0][0]
      .replace(/([A-Z])/g, ' $1')
      .toLowerCase()

    return (
      `${content.title} is a strong match for your ${mood} mood` +
      (mealMode ? ` during ${mealMode.replace('_', ' ')}` : '') +
      `. It fits your ${timeAvail}-minute window and scores highly on ${topFactor}.`
    )
  }
}

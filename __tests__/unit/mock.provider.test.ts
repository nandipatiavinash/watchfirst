import { MockRecommendationProvider } from '@/lib/recommendation/mock.provider'
import type { ScoredContent, MovieContent } from '@/types'

const makeItem = (id: string, score: number): ScoredContent => ({
  score,
  content: {
    type: 'movie', id, title: `Movie ${id}`,
    language: 'en', genres: [],
  } as MovieContent,
  scoreBreakdown: {
    durationMatch: 0.5, genreMatch: 0.5, moodMatch: 0.5,
    languageMatch: 0.5, platformMatch: 0.5, popularity: 0.5,
    rating: 0.5, recency: 0.5, favoriteActor: 0,
    favoriteDirector: 0, timeOfDay: 0.5, mealMode: 0.5,
    personalHistory: 0.5, userFeedback: 0.5,
  },
})

const baseInput = {
  userId: 'u1', timeAvail: 30 as const, mood: 'funny' as const,
}

describe('MockRecommendationProvider', () => {
  const provider = new MockRecommendationProvider()

  it('has name "mock"', () => {
    expect(provider.name).toBe('mock')
  })

  it('returns top N items sorted by score descending', async () => {
    const candidates = [
      makeItem('a', 0.5),
      makeItem('b', 0.9),
      makeItem('c', 0.3),
      makeItem('d', 0.8),
      makeItem('e', 0.7),
      makeItem('f', 0.1),
    ]
    const results = await provider.recommend(baseInput, candidates, 3)
    expect(results).toHaveLength(3)
    expect(results[0].content.id).toBe('b')
    expect(results[1].content.id).toBe('d')
    expect(results[2].content.id).toBe('e')
  })

  it('returns all items when topN > candidates length', async () => {
    const candidates = [makeItem('a', 0.5), makeItem('b', 0.9)]
    const results = await provider.recommend(baseInput, candidates, 10)
    expect(results).toHaveLength(2)
  })

  it('rerank returns items unchanged', async () => {
    const items = [makeItem('a', 0.9), makeItem('b', 0.5)]
    const result = await provider.rerank(baseInput, items)
    expect(result).toEqual(items)
  })

  it('explain returns a non-empty string', async () => {
    const item = makeItem('x', 0.8)
    const explanation = await provider.explain(baseInput, item)
    expect(typeof explanation).toBe('string')
    expect(explanation.length).toBeGreaterThan(10)
    expect(explanation).toContain('Movie x')
  })

  it('explain mentions mood', async () => {
    const item = makeItem('x', 0.8)
    const explanation = await provider.explain(
      { ...baseInput, mood: 'horror' as const }, item
    )
    expect(explanation).toContain('horror')
  })
})

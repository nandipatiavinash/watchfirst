import { GeminiRecommendationProvider } from '@/lib/recommendation/gemini.provider'
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

describe('GeminiRecommendationProvider', () => {
  const originalEnv = process.env
  let originalFetch: typeof global.fetch

  beforeAll(() => {
    originalFetch = global.fetch
  })

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterEach(() => {
    global.fetch = originalFetch
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('has name "gemini"', () => {
    const provider = new GeminiRecommendationProvider()
    expect(provider.name).toBe('gemini')
  })

  it('falls back to scoring order if GEMINI_API_KEY is missing', async () => {
    delete process.env.GEMINI_API_KEY
    const provider = new GeminiRecommendationProvider()

    const candidates = [
      makeItem('a', 0.5),
      makeItem('b', 0.9),
      makeItem('c', 0.3),
    ]
    const results = await provider.recommend(baseInput, candidates, 2)
    expect(results).toHaveLength(2)
    expect(results[0].content.id).toBe('b') // highest score first
    expect(results[1].content.id).toBe('a')
  })

  it('calls Gemini API and parses response when API key is set', async () => {
    process.env.GEMINI_API_KEY = 'dummy-key'
    const provider = new GeminiRecommendationProvider()

    const candidates = [
      makeItem('a', 0.5),
      makeItem('b', 0.9),
      makeItem('c', 0.3),
    ]

    const mockResponse = {
      recommendations: [
        { id: 'c', explanation: 'c is actually best suited for funny mood.' },
        { id: 'a', explanation: 'a is a solid runner-up.' }
      ]
    }

    const mockFetch = jest.fn().mockImplementation(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          candidates: [
            {
              content: {
                parts: [
                  { text: JSON.stringify(mockResponse) }
                ]
              }
            }
          ]
        })
      })
    )
    global.fetch = mockFetch as any

    const results = await provider.recommend(baseInput, candidates, 2)
    expect(mockFetch).toHaveBeenCalled()
    expect(results).toHaveLength(2)
    expect(results[0].content.id).toBe('c') // Reranked first by Gemini
    expect(results[1].content.id).toBe('a') // Reranked second

    // Check explanation cache usage
    const explanation = await provider.explain(baseInput, results[0])
    expect(explanation).toBe('c is actually best suited for funny mood.')
  })
})

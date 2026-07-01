import { scoreContent } from '@/lib/recommendation/scoring.engine'
import { DEFAULT_WEIGHTS } from '@/types'
import type { MovieContent } from '@/types'

const baseMovie: MovieContent = {
  type:       'movie',
  id:         '1',
  title:      'Test Movie',
  language:   'en',
  rating:     8.0,
  popularity: 500,
  runtimeMins:30,
  genres:     [{ id: 35, name: 'Comedy' }],
}

const baseInput = {
  userId:   'user-1',
  timeAvail: 30 as const,
  mood:     'funny' as const,
  language: 'en',
}

describe('scoreContent', () => {
  it('returns a score between 0 and 1', () => {
    const result = scoreContent(baseMovie, baseInput)
    expect(result.score).toBeGreaterThanOrEqual(0)
    expect(result.score).toBeLessThanOrEqual(1)
  })

  it('scores duration match high when runtime matches timeAvail exactly', () => {
    const result = scoreContent(baseMovie, baseInput)
    expect(result.scoreBreakdown.durationMatch).toBeGreaterThanOrEqual(0.8)
  })

  it('scores duration match low when runtime is far from timeAvail', () => {
    const longMovie: MovieContent = { ...baseMovie, runtimeMins: 180 }
    const result = scoreContent(longMovie, { ...baseInput, timeAvail: 10 })
    expect(result.scoreBreakdown.durationMatch).toBeLessThan(0.3)
  })

  it('scores genre match high when genres align with mood', () => {
    // Comedy (35) should match "funny" mood
    const result = scoreContent(baseMovie, { ...baseInput, mood: 'funny' })
    expect(result.scoreBreakdown.genreMatch).toBeGreaterThan(0.2)
  })

  it('scores language match 1.0 when language matches', () => {
    const result = scoreContent(baseMovie, { ...baseInput, language: 'en' })
    expect(result.scoreBreakdown.languageMatch).toBe(1)
  })

  it('scores language match 0.3 when language does not match', () => {
    const result = scoreContent(baseMovie, { ...baseInput, language: 'ja' })
    expect(result.scoreBreakdown.languageMatch).toBe(0.3)
  })

  it('boosts genre score with matching user favorite genres', () => {
    const withFav    = scoreContent(baseMovie, baseInput, DEFAULT_WEIGHTS, [35])
    const withoutFav = scoreContent(baseMovie, baseInput, DEFAULT_WEIGHTS, [])
    expect(withFav.score).toBeGreaterThanOrEqual(withoutFav.score)
  })

  it('includes all expected breakdown keys', () => {
    const { scoreBreakdown } = scoreContent(baseMovie, baseInput)
    const expectedKeys = [
      'durationMatch', 'genreMatch', 'moodMatch', 'languageMatch',
      'platformMatch', 'popularity', 'rating', 'recency',
      'favoriteActor', 'favoriteDirector', 'timeOfDay',
      'mealMode', 'personalHistory', 'userFeedback',
    ]
    expectedKeys.forEach(k => {
      expect(scoreBreakdown).toHaveProperty(k)
    })
  })

  it('handles missing runtime gracefully', () => {
    const noRuntime: MovieContent = { ...baseMovie, runtimeMins: undefined }
    const result = scoreContent(noRuntime, baseInput)
    expect(result.scoreBreakdown.durationMatch).toBe(0.5)
  })
})

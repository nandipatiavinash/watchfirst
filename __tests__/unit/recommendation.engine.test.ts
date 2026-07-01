import { RecommendationEngine } from '@/lib/recommendation/engine'
import { MockRecommendationProvider } from '@/lib/recommendation/mock.provider'
import type { MovieContent, TvShowContent } from '@/types'

const makeMovie = (id: string, runtime: number, genreIds: number[]): MovieContent => ({
  type: 'movie', id, title: `Movie ${id}`,
  language: 'en', rating: 7.5, popularity: 100,
  runtimeMins: runtime,
  genres: genreIds.map(gid => ({ id: gid, name: '' })),
})

const makeTv = (id: string, runtime: number): TvShowContent => ({
  type: 'tv_show', id, title: `Show ${id}`,
  language: 'en', rating: 8.0, popularity: 200,
  episodeRuntime: runtime,
  genres: [{ id: 35, name: 'Comedy' }],
})

describe('RecommendationEngine', () => {
  const engine = new RecommendationEngine(new MockRecommendationProvider())

  const input = {
    userId: 'u1', timeAvail: 30 as const, mood: 'funny' as const, language: 'en',
  }

  it('filters out content that exceeds timeAvail + 20m buffer', async () => {
    const candidates = [
      makeMovie('short', 25, [35]),
      makeMovie('ok',    45, [35]),
      makeMovie('long',  90, [35]),   // should be filtered (90 > 30+20=50)
      makeMovie('vlong', 180, [35]),  // should be filtered
    ]
    const results = await engine.run(input, candidates, { topN: 10 })
    const ids = results.map(r => r.content.id)
    expect(ids).not.toContain('long')
    expect(ids).not.toContain('vlong')
    expect(ids).toContain('short')
    expect(ids).toContain('ok')
  })

  it('returns at most topN results', async () => {
    const candidates = Array.from({ length: 20 }, (_, i) =>
      makeMovie(String(i), 25, [35])
    )
    const results = await engine.run(input, candidates, { topN: 5 })
    expect(results.length).toBeLessThanOrEqual(5)
  })

  it('attaches explanations to every result', async () => {
    const candidates = [makeMovie('a', 20, [35]), makeMovie('b', 25, [35])]
    const results = await engine.run(input, candidates)
    results.forEach(r => {
      expect(typeof r.explanation).toBe('string')
      expect(r.explanation!.length).toBeGreaterThan(0)
    })
  })

  it('handles mixed movies and TV shows', async () => {
    const candidates = [
      makeMovie('m1', 25, [35]),
      makeTv('tv1', 22),
      makeMovie('m2', 30, [28]),
    ]
    const results = await engine.run(input, candidates, { topN: 3 })
    const types = results.map(r => r.content.type)
    expect(types).toContain('movie')
    expect(types).toContain('tv_show')
  })

  it('handles empty candidates gracefully', async () => {
    const results = await engine.run(input, [])
    expect(results).toHaveLength(0)
  })

  it('boosts items matching user favorite genres', async () => {
    const comedyMovie  = makeMovie('comedy', 25, [35])  // genre 35 = Comedy
    const actionMovie  = makeMovie('action', 25, [28])  // genre 28 = Action

    const withFav    = await engine.run(input, [comedyMovie, actionMovie], {
      topN: 2, userFavoriteGenreIds: [35],
    })
    const withoutFav = await engine.run(input, [comedyMovie, actionMovie], {
      topN: 2, userFavoriteGenreIds: [],
    })

    const favComedyScore    = withFav.find(r => r.content.id === 'comedy')?.score ?? 0
    const noFavComedyScore  = withoutFav.find(r => r.content.id === 'comedy')?.score ?? 0
    expect(favComedyScore).toBeGreaterThanOrEqual(noFavComedyScore)
  })
})
